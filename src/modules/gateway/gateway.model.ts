import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Gateway {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  wallet_address: string;

  @Prop({ required: false, default: null })
  charge?: number;

  @Prop({ required: false, default: null })
  conversion_rate?: number;
}

export const GatewaySchema = SchemaFactory.createForClass(Gateway);
