import { PartialType } from '@nestjs/mapped-types';
import { CreateWithdrawalMessageDto } from './create-withdrawal-message.dto';

export class UpdateWithdrawalMessageDto extends PartialType(CreateWithdrawalMessageDto) {}
