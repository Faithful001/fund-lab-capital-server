import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.model';
import { Plan } from '../plan/plan.model';
import { Gateway } from '../gateway/gateway.model';

class Image {
  @Prop({ type: String, required: false, default: null })
  url: string;

  @Prop({ type: String, required: false, default: null })
  alt_text: string;

  @Prop({ type: String, required: false, default: null })
  thumbnail: string;

  @Prop({ type: String, required: false, default: null })
  public_id: string;
}

enum StatusEnum {
  Completed = 'completed',
  Stopped = 'stopped',
  Active = 'active',
}

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Image })
  image: Image;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: User.name })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: Plan.name })
  plan_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: Gateway.name })
  gateway_id: mongoose.Types.ObjectId;

  @Prop({ enum: StatusEnum, required: false, default: StatusEnum.Active })
  status: StatusEnum;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
