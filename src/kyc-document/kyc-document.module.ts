import { Module } from '@nestjs/common';
import { KycDocumentService } from './kyc-document.service';
import { KycDocumentController } from './kyc-document.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { KycDocument, KycDocumentSchema } from './kyc-document.model';
import { UserModule } from 'src/modules/user/user.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KycDocument.name, schema: KycDocumentSchema },
    ]),
    UserModule,
    AdminModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        const imageMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (imageMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type provided'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [KycDocumentController],
  providers: [KycDocumentService],
})
export class KycDocumentModule {}
