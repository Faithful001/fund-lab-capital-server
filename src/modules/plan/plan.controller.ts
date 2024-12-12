import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() createPlanDto: CreatePlanDto) {
    return await this.planService.create(createPlanDto);
  }

  @Get('get/:id?')
  @HttpCode(HttpStatus.OK)
  public async get(
    @Param('id') id?: string,
    @Query('desc') desc: 'true' | 'false' = 'true',
  ) {
    return await this.planService.get(id, desc);
  }

  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  public async update(@Param('id') id: string, updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(id, updatePlanDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  public async delete(@Param('id') id: string) {
    return await this.planService.delete(id);
  }
}
