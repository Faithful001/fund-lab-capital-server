import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.model';
import { User, UserSchema } from '../user/user.model';
import {
  Transaction,
  TransactionSchema,
} from '../transaction/transaction.model';
import { Referral, ReferralSchema } from '../referral/referral.model';
import { Investment, InvestmentSchema } from '../investment/investment.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Investment.name, schema: InvestmentSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [MongooseModule],
})
export class AdminModule {}
