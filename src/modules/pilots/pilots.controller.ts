import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { Pilot } from './entities/pilot.entity';
import { PilotsService } from './pilots.service';

@ApiTags('Pilotos')
@PermissionResource('pilots')
@Controller('pilots')
export class PilotsController extends BaseCrudController<Pilot> {
  constructor(service: PilotsService) {
    super(service);
  }
}

@ApiTags('Verificación de piloto')
@Controller('verificarPiloto')
export class PilotVerificationController {
  constructor(private readonly pilots: PilotsService) {}

  @Public()
  @Get(':identifier')
  @ApiOperation({ summary: 'Verificar piloto por DNI o licencia' })
  @ApiParam({ name: 'identifier', description: 'DNI o licencia; dígitos y guiones, máximo 32 caracteres.' })
  verify(@Param('identifier') identifier: string) {
    if (!/^[0-9-]{1,32}$/.test(identifier)) {
      throw new BadRequestException('Identificador de piloto inválido.');
    }
    return this.pilots.verifyIdentifier(identifier);
  }
}
