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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard) //VerificationGuard was here
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  public async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createGatewayDto: CreateGatewayDto,
  ) {
    return await this.gatewayService.create(file, createGatewayDto);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('get/:id?')
  @HttpCode(HttpStatus.OK)
  public async get(@Param('id') id?: string) {
    return await this.gatewayService.get(id);
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('get-by-name/:id')
  @HttpCode(HttpStatus.OK)
  public async getByName(@Param('id') id: string) {
    return await this.gatewayService.getByName(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  public async update(
    @Param('id') id: string,
    @Body() updateGatewayDto: UpdateGatewayDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.gatewayService.update(id, updateGatewayDto, file);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  public async delete(@Param('id') id: string) {
    return await this.gatewayService.delete(id);
  }
}
