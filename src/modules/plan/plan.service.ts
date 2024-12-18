import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './plan.model';
import mongoose, { Model, SortOrder } from 'mongoose';
import { CreatePlanDto } from './dto/create-plan.dto';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  // @HttpCode(HttpStatus.)
  constructor(
    @InjectModel(Plan.name) private readonly planModel: Model<Plan>,
  ) {}

  public async create(createPlanDto: CreatePlanDto) {
    try {
      //   const {
      //     name,
      //     min_deposit,
      //     max_deposit,
      //     profit_withdraw,
      //     return_type,
      //     roi,
      //     roi_duration,
      //   } = createPlanDto;

      const newPlan = await this.planModel.create(createPlanDto);
      return {
        success: true,
        message: 'Plan created successfully',
        data: newPlan,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async get(id?: string, desc: 'true' | 'false' = 'true') {
    try {
      if (id) {
        if (!mongoose.isValidObjectId(id)) {
          throw new BadRequestException('Invalid id provided');
        }
        const plan = await this.planModel.findOne({ _id: id }).exec();
        if (!plan) {
          return {
            success: true,
            message: 'No plan',
            data: plan,
          };
        }

        return {
          success: true,
          message: `Plan retrieved`,
          data: plan,
        };
      }

      const sortOrder: { [key: string]: SortOrder } = {
        createdAt: desc === 'true' ? 1 : -1,
      };

      const plans = await this.planModel.find().sort(sortOrder).exec();
      if (!plans) {
        return {
          success: true,
          message: 'No plan',
          data: plans,
        };
      }
      return {
        success: true,
        message: `All plans retrieved`,
        data: plans,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getByName(name: string) {
    try {
      if (!name) {
        throw new BadRequestException(`Parameter required`);
      }
      // const user = this.userRequest.getUser();
      // const user_id = req?.user.id;

      const plan = await this.planModel.findOne({ name }).exec();
      if (!plan) {
        throw new NotFoundException('Plan with this name does not exist');
      }
      return {
        success: true,
        message: 'Plan retrieved',
        data: plan,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async update(id: string, body: UpdatePlanDto) {
    try {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException('Invalid id provided');
      }

      const updatedPlan = await this.planModel.findByIdAndUpdate(
        { _id: id },
        { ...body },
        { new: true },
      );
      return {
        success: true,
        message: 'Plan updated successfully',
        data: updatedPlan,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async delete(id: string) {
    try {
      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException('Invalid id provided');
      }

      const deletedPlan = await this.planModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'Plan deleted successfully',
        data: deletedPlan,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
