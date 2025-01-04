import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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
export class KycDocument {
  @Prop({ type: Image, required: false, default: null })
  image: Image;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  user_id: mongoose.Types.ObjectId;
}

export const KycDocumentSchema = SchemaFactory.createForClass(KycDocument);
