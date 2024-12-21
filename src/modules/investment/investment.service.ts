import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Investment } from './investment.model';
import mongoose, { Model } from 'mongoose';
import { Request } from 'express';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { checkIfDocumentExists } from 'src/utils/checkIfDocumentExists.util';
import { Gateway } from '../gateway/gateway.model';
import { Plan } from '../plan/plan.model';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { Transaction } from '../transaction/transaction.model';
import { Wallet } from '../wallet/wallet.model';
import { User } from '../user/user.model';
import { Transform } from 'src/utils/transform';

enum StatusEnum {
  Completed = 'completed',
  Stopped = 'stopped',
  Active = 'active',
}

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<Investment>,
    @InjectModel(Gateway.name) private readonly gatewayModel: Model<Gateway>,
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    req: Request,
    file: Express.Multer.File,
    createInvestmentDto: CreateInvestmentDto,
  ) {
    const { amount, gateway, plan, wallet } = createInvestmentDto;
    const user_id = req.user?.id;

    // Validate that a file was uploaded
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    try {
      const planDoc = await this.planModel.findOne({ name: plan });
      if (!planDoc) {
        throw new NotFoundException('Plan not found');
      }

      const gatewayDoc = await this.gatewayModel.findOne({ name: gateway });
      if (!gatewayDoc) {
        throw new NotFoundException('Gateway not found');
      }

      let walletDoc: any;
      if (wallet) {
        walletDoc = await this.walletModel.findOne({ name: wallet }).exec();
        if (!walletDoc) {
          throw new NotFoundException(`Wallet "${wallet}" not found`);
        }
      }

      if (!Number(amount) || Number(amount) <= 0) {
        throw new BadRequestException(
          'Amount must be a valid number greater than zero',
        );
      }

      const { buffer, originalname } = file;
      const imageName = originalname.includes('.')
        ? originalname.split('.')[0]
        : originalname;

      const { alt_text, public_id, url, thumbnail_url } =
        await this.cloudinaryService.uploadStream(imageName, buffer, true);

      // Create the investment
      const createdInvestment = await this.investmentModel.create({
        amount: Number(amount),
        gateway_id: gatewayDoc._id,
        plan_id: planDoc._id,
        user_id,
        image: {
          alt_text,
          public_id,
          url,
          thumbnail_url,
        },
      });

      const user = await this.userModel.findById(user_id).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.plan_id = planDoc._id;
      await user.save();

      const transactionData: any = {
        amount: Number(amount),
        type: 'investment',
        user_id,
        gateway_id: gatewayDoc._id,
      };

      if (wallet) {
        transactionData.wallet_id = walletDoc._id;

        if (walletDoc.balance < Number(amount)) {
          throw new BadRequestException('Insufficient wallet balance');
        }

        walletDoc.balance -= Number(amount);
        await walletDoc.save();
      }

      await this.transactionModel.create(transactionData);

      // Transform the user object for the response
      const { password, ...restUserObject } = user.toObject();
      const transformedUser = Transform.data(restUserObject, [
        ['plan_id', 'plan'],
      ]);

      return {
        success: true,
        message: 'Investment created successfully',
        data: {
          investment: createdInvestment,
          user: transformedUser,
        },
      };
    } catch (error) {
      handleApplicationError(error);
    }
  }

  async findAll(req: Request, status?: StatusEnum) {
    try {
      const user_id = req.user.id;

      // Ensure the status provided is valid
      if (status && !Object.values(StatusEnum).includes(status)) {
        throw new BadRequestException('Invalid status provided');
      }

      // Build query object
      const investmentModelBuilder: Record<string, any> = { user_id };
      if (status) {
        investmentModelBuilder.status = status;
      }

      // Query investments
      const investments = await this.investmentModel
        .find(investmentModelBuilder)
        .sort({ createdAt: -1 })
        .populate('user_id')
        .populate('plan_id', 'name')
        .populate('gateway_id', 'name')
        .exec();

      const transformedInvestments = Transform.data(investments, [
        ['user_id', 'user'],
        ['plan_id', 'plan'],
        ['gateway_id', 'gateway'],
      ]);

      // Return the result
      return {
        success: true,
        message: 'Investments retrieved successfully',
        data: transformedInvestments,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async findOne(id: string) {
    try {
      const investment = await this.investmentModel.findById(id).exec();
      if (!investment) {
        throw new NotFoundException('Invesment not found');
      }
      return {
        success: true,
        message: 'Invesment retrieved',
        data: investment,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  /**
   *Admin method to update an investment status, Method: POST
   **/
  async updateStatus(
    id: string,
    status: StatusEnum,
    user_id: mongoose.Types.ObjectId,
    amount: number,
  ) {
    try {
      if (!id || !status) {
        throw new BadRequestException('All fields and parameters are required');
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException('Invalid investment id');
      }

      if (Object.values(StatusEnum).includes(status)) {
        throw new BadRequestException('Invalid status provided');
      }

      if (status === StatusEnum.Completed) {
        if (!amount || !user_id) {
          throw new BadRequestException(
            'Amount and user id are required for completed status',
          );
        }
      }
      // const user_id = req.user;
      const investment = await this.investmentModel.findById(id).exec();
      if (!investment) {
        throw new NotFoundException('Investment not found');
      }

      switch (status) {
        case StatusEnum.Completed:
          if (!amount || !user_id) {
            throw new BadRequestException(
              'Amount and user id are required for completed status',
            );
          }
          if (investment.status !== StatusEnum.Active) {
            throw new BadRequestException(
              'Only active investments can be completed',
            );
          }
          investment.status = StatusEnum.Completed;
          await investment.save();
          const wallet = await this.walletModel.findOne({
            user_id,
            name: 'MAIN',
          });
          if (!wallet) {
            throw new NotFoundException('wallet not found');
          }
          wallet.balance += amount;

          break;
        case StatusEnum.Stopped:
          if (investment.status !== StatusEnum.Active) {
            throw new BadRequestException(
              'Only active investments can be completed',
            );
          }
          investment.status = StatusEnum.Stopped;
          await investment.save();
          break;
        default:
          throw new ConflictException(
            'Investments can only be completed or stopped',
          );
      }

      return {
        success: true,
        message: 'Investment updated successfully',
        data: investment,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async update(id: string, updateInvestmentDto: UpdateInvestmentDto) {
    try {
      const updatedInvestment = await this.investmentModel.findByIdAndUpdate(
        id,
        { ...updateInvestmentDto },
        { new: true },
      );
      if (!updatedInvestment) {
        throw new NotFoundException('Invesment not found');
      }
      return {
        success: true,
        message: 'Investment updated',
        data: updatedInvestment,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async remove(id: string) {
    try {
      const deletedInvestment =
        await this.investmentModel.findByIdAndDelete(id);
      if (!deletedInvestment) {
        throw new NotFoundException('Invesment not found');
      }
      return {
        success: true,
        message: 'Investment deleted',
        data: deletedInvestment,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
