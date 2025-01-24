import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gateway, GatewaySchema } from './gateway.model';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';
import { CloudinaryService } from 'src/services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gateway.name, schema: GatewaySchema }]),
    UserModule,
    AdminModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, CloudinaryService],
})
export class GatewayModule {}
