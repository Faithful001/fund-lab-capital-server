import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Investment } from './investment.model';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CloudinaryService } from 'src/contexts/services/cloudinary.service';
import { checkIfDocumentExists } from 'src/utils/checkIfDocumentExists.util';
import { Gateway } from '../gateway/gateway.model';
import { Plan } from '../plan/plan.model';
import { handleApplicationError } from 'src/utils/handle-application-error.util';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<Investment>,
    @InjectModel(Gateway.name) private readonly gatewayModel: Model<Gateway>,
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    req: Request,
    file: Express.Multer.File,
    createInvestmentDto: CreateInvestmentDto,
  ) {
    const { amount, gateway_id, plan_id } = createInvestmentDto;
    const user_id = req.user?.id;

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    try {
      const [gateway, plan] = await Promise.all([
        checkIfDocumentExists<Gateway>(this.gatewayModel, gateway_id),
        checkIfDocumentExists<Plan>(this.planModel, plan_id),
      ]);

      const { buffer, originalname } = file;
      const imageName = originalname.includes('.')
        ? originalname.split('.')[0]
        : originalname;

      const { alt_text, public_id, url, thumbnail_url } =
        await this.cloudinaryService.uploadStream(imageName, buffer, true);

      const createdInvestment = await this.investmentModel.create({
        amount: Number(amount),
        gateway_id: gateway.id,
        plan_id: plan.id,
        user_id,
        image: {
          alt_text,
          public_id,
          url,
          thumbnail_url,
        },
      });

      return {
        success: true,
        message: 'Investment created successfully',
        data: createdInvestment,
      };
    } catch (error) {
      handleApplicationError(error);
    }
  }

  async findAll(req: Request) {
    try {
      const user_id = req.user.id;
      const investments = await this.investmentModel
        .find({ user_id: user_id })
        .sort({ createdAt: -1 })
        .exec();
      return {
        success: true,
        message: 'Investments retrieved',
        data: investments,
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
