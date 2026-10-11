import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PilotsService } from './pilots.service';

@ApiTags('Verificación de piloto')
@Controller('verificarPiloto')
export class PilotVerificationController {
  constructor(private readonly pilots: PilotsService) {}

  @Get(':identifier')
  @ApiOperation({ summary: 'Verificar piloto por DNI o licencia' })
  @ApiParam({
    name: 'identifier',
    description: 'DNI o licencia; dígitos y guiones, máximo 32 caracteres.',
  })
  verify(@Param('identifier') identifier: string) {
    if (!/^[0-9-]{1,32}$/.test(identifier)) {
      throw new BadRequestException('Identificador de piloto inválido.');
    }
    return this.pilots.verifyIdentifier(identifier);
  }
}
