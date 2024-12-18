import {
  BadRequestException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { Gateway } from './gateway.model';
import mongoose, { Model } from 'mongoose';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { Request } from 'express';

@Injectable()
export class GatewayService {
  constructor(
    @InjectModel(Gateway.name)
    private readonly gatewayModel: Model<Gateway>,
  ) {}

  public async create(createGatewayDto: CreateGatewayDto) {
    try {
      const { name, wallet_address, charge, conversion_rate } =
        createGatewayDto;
      if (!name || !wallet_address) {
        throw new BadRequestException(
          'The name and wallet_wallet_address fields required',
        );
      }
      if (charge < 1) {
        throw new BadRequestException('charge must be a positive integer');
      }

      const gatewayDoc = await this.gatewayModel.create({
        name,
        wallet_address,
        charge,
        conversion_rate,
      });

      return {
        status: true,
        message: 'Gateway created successfully',
        data: gatewayDoc,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async get(id?: string) {
    try {
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new BadRequestException(`Invalid ID format: ${id}`);
        }

        // Find gateway by ID
        const gateway = await this.gatewayModel.findOne({ _id: id }).exec();

        if (!gateway) {
          throw new NotFoundException(`No gateway found with the id: ${id}`);
        }

        return {
          success: true,
          message: `Gateway with the id: ${id}`,
          data: gateway,
        };
      } else {
        const gateways = await this.gatewayModel
          .find()
          .sort({ createdAt: -1 })
          .exec();

        return {
          success: true,
          message: 'All gateways',
          data: gateways,
        };
      }
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

      const gateway = await this.gatewayModel.findOne({ name }).exec();
      if (!gateway) {
        throw new NotFoundException('Gateway with this name does not exist');
      }
      return {
        success: true,
        message: 'Gateway retrieved',
        data: gateway,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async update(id: string, body: UpdateGatewayDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const updatedGateway = await this.gatewayModel.findByIdAndUpdate(
        id,
        { ...body },
        { new: true },
      );

      if (!updatedGateway) {
        throw new NotFoundException(`No gateway found with the id: ${id}`);
      }
      return {
        success: true,
        message: 'Update successful',
        data: updatedGateway,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async delete(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }
      const deletedGateway = await this.gatewayModel.findByIdAndDelete(id);
      if (!deletedGateway) {
        throw new NotFoundException(`No gateway with the id: ${id} found`);
      }
      return {
        success: true,
        message: 'Gateway deleted',
        data: deletedGateway,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
