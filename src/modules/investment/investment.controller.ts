import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';

enum StatusEnum {
  Pending = 'pending',
  Completed = 'completed',
  Stopped = 'stopped',
  Active = 'active',
  Declined = 'declined',
}

@Roles(Role.USER)
@UseGuards(AuthGuard)
@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() createInvestmentDto: CreateInvestmentDto,
  ) {
    return this.investmentService.create(req, file, createInvestmentDto);
  }

  @Get('get')
  @HttpCode(HttpStatus.OK)
  findAll(@Req() req: Request, status?: StatusEnum) {
    return this.investmentService.findAll(req, status);
  }

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch('update-status/:id')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('status') status?: StatusEnum,
  ) {
    return this.investmentService.updateStatus(req, id, status);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateInvestmentDto: UpdateInvestmentDto,
  ) {
    return this.investmentService.update(id, updateInvestmentDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
  }
}
