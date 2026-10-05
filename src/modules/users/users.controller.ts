import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Usuarios')
@ApiBearerAuth('session-bearer')
@Controller('users')
@PermissionResource('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (admin)' })
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.users.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear usuario (admin)' })
  @ApiResponse({ status: 201, description: 'Creado; password_hash nunca se devuelve.' })
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.users.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar usuario (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.users.remove(id);
  }
}