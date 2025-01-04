import { Module } from '@nestjs/common';
import { WithdrawalMessageService } from './withdrawal-message.service';
import { WithdrawalMessageController } from './withdrawal-message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WithdrawalMessage,
  WithdrawalMessageSchema,
} from './withdrawal-message.model';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WithdrawalMessage.name, schema: WithdrawalMessageSchema },
    ]),
    UserModule,
    AdminModule,
  ],
  controllers: [WithdrawalMessageController],
  providers: [WithdrawalMessageService],
})
export class WithdrawalMessageModule {}
