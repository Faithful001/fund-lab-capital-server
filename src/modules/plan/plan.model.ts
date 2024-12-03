import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    min: [1, 'Minimum deposit must be at least 1.'],
  })
  min_deposit: number;

  @Prop({
    required: true,
    min: [1, 'Minimum deposit must be at least 1.'],
  })
  max_deposit: number;

  @Prop({
    required: true,
    min: [1, 'Minimum deposit must be at least 1.'],
  })
  roi: number;

  @Prop({ required: true })
  roi_duration: number;

  @Prop({ required: false, default: 'Lifetime' })
  @IsEnum(['Lifetime'])
  return_type: string;

  @Prop({ required: true, default: 'Anytime' })
  @IsEnum(['Anytime'])
  profit_withdraw: string;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
