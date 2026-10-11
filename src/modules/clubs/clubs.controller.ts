import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClubsService } from './clubs.service';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  findAll() {
    return this.clubs.findPublic();
  }
}
