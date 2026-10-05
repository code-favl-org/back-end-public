import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { Club } from '../clubs/entities/club.entity';
import { License } from '../licenses/entities/license.entity';
import { Pilot } from './entities/pilot.entity';

@Injectable()
export class PilotsService extends BaseCrudService<Pilot> {
  constructor(
    @InjectRepository(Pilot) repository: Repository<Pilot>,
    @InjectRepository(License) private readonly licenses: Repository<License>,
    @InjectRepository(Club) private readonly clubs: Repository<Club>,
  ) {
    super(repository);
  }

  async verifyIdentifier(identifier: string) {
    const pilot = await this.repository.findOne({
      where: { nationalId: identifier },
    });
    const license = pilot
      ? await this.licenses.findOne({ where: { pilotId: pilot.id } })
      : await this.licenses.findOne({ where: { licenseNumber: identifier } });
    const resolvedPilot = pilot ?? (license
      ? license.pilotId !== null
        ? await this.repository.findOne({ where: { id: license.pilotId } })
        : null
      : null);

    if (!resolvedPilot || !license) return null;

    const club = resolvedPilot.clubId
      ? await this.clubs.findOne({ where: { id: resolvedPilot.clubId } })
      : null;
    const expired = Boolean(
      license.expiresAt && license.expiresAt < new Date().toISOString().slice(0, 10),
    );

    return {
      dni: resolvedPilot.nationalId,
      nombre: resolvedPilot.name,
      licencia: license.licenseNumber,
      modalidad: license.modalityCode,
      categoria: license.category ?? resolvedPilot.category,
      club: club?.name ?? null,
      vencimiento: license.expiresAt,
      estado: expired ? 'vencido' : license.status ?? resolvedPilot.status,
    };
  }
}
