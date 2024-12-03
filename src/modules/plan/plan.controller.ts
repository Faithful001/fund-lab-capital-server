import { Body, Controller, Param, Post } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('create')
  public async create(@Body() createPlanDto: CreatePlanDto) {
    return await this.planService.create(createPlanDto);
  }

  @Post('get/:id?')
  public async get(@Param(':id') id?: string) {
    return await this.planService.get(id);
  }

  @Post('update/:id')
  public async update(@Param(':id') id: string, updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(id, updatePlanDto);
  }

  @Post('delete/:id')
  public async delete(@Param(':id') id: string) {
    return await this.planService.delete(id);
  }
}
