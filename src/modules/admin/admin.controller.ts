import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.register(createAdminDto);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body('email') email: string, @Body('password') password: string) {
    return this.adminService.login(email, password);
  }

  @Post('auth/verify-token')
  @HttpCode(HttpStatus.OK)
  verifyToken(@Body('token') token: string) {
    return this.adminService.verifyToken(token);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('get-total')
  @HttpCode(HttpStatus.OK)
  getTotal(
    @Param('module')
    module?: 'users' | 'deposits' | 'withdrawals' | 'referrals' | 'investments',
  ) {
    return this.adminService.getTotalDocuments(module);
  }
}
