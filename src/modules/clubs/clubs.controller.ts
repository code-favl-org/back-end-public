import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Club } from './entities/club.entity';
import { ClubsService } from './clubs.service';

@ApiTags('Clubs')
@PermissionResource('clubs')
@Controller('clubs')
export class ClubsController extends BaseCrudController<Club> {
  constructor(private readonly clubs: ClubsService) {
    super(clubs);
  }

  @Public()
  @Get()
  findAll() {
    return this.clubs.findPublic();
  }
}
