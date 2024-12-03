import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Gateway, GatewaySchema } from './gateway.model';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gateway.name, schema: GatewaySchema }]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
