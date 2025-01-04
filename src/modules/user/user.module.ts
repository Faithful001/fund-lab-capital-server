import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.model';
import { Wallet, WalletSchema } from '../wallet/wallet.model';
import { Referral, ReferralSchema } from '../referral/referral.model';
import { AdminModule } from '../admin/admin.module';
import {
  Transaction,
  TransactionSchema,
} from '../transaction/transaction.model';
import { OtpService } from '../otp/otp.service';
import { Otp, OtpSchema } from '../otp/otp.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import {
  KycDocument,
  KycDocumentSchema,
} from 'src/kyc-document/kyc-document.model';
import { Gateway, GatewaySchema } from '../gateway/gateway.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Gateway.name, schema: GatewaySchema },
      { name: KycDocument.name, schema: KycDocumentSchema },
    ]),
    AdminModule,
  ],
  controllers: [UserController],
  providers: [UserService, OtpService, CloudinaryService],
  exports: [MongooseModule],
})
export class UserModule {}
