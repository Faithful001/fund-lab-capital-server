import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('create')
  public async create(@Body() createGatewayDto: CreateGatewayDto) {
    return await this.gatewayService.create(createGatewayDto);
  }

  @Get('get/:id?')
  public async get(@Param('id') id?: string) {
    return await this.gatewayService.get(id);
  }

  @Patch('update/:id')
  public async update(
    @Param('id') id: string,
    @Body() updateGatewayDto: UpdateGatewayDto,
  ) {
    return await this.gatewayService.update(id, updateGatewayDto);
  }

  @Delete('delete/:id')
  public async delete(@Param('id') id: string) {
    return await this.gatewayService.delete(id);
  }
}
