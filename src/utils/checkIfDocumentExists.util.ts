import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export async function checkIfDocumentExists<T>(
  model: Model<T>,
  id: string | mongoose.Types.ObjectId,
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid ObjectId format: ${id}`);
  }

  const document = await model.findById(id);
  if (!document) {
    throw new NotFoundException(`Document with id ${id} does not exist`);
  }
  return document;
}
