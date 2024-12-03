import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './plan.model';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
