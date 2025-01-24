import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

@Schema({ timestamps: true })
export class Gateway {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  wallet_address: string;

  @Prop({ required: false, default: 0 })
  charge?: number;

  @Prop({ required: false, default: null })
  conversion_rate?: number;

  @Prop({ required: false, type: Image, default: null })
  image: Image;
}

export const GatewaySchema = SchemaFactory.createForClass(Gateway);
