import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentSchema } from './investment.model';
import { Gateway, GatewaySchema } from '../gateway/gateway.model';
import { Plan, PlanSchema } from '../plan/plan.model';
import { CloudinaryService } from 'src/contexts/services/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: Gateway.name, schema: GatewaySchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService, CloudinaryService],
})
export class InvestmentModule {}
