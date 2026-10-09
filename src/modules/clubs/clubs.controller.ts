import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { Club } from './entities/club.entity';
import { ClubsService } from './clubs.service';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController extends BaseCrudController<Club> {
  constructor(private readonly clubs: ClubsService) {
    super(clubs);
  }

  @Get()
  findAll() {
    return this.clubs.findPublic();
  }
}
