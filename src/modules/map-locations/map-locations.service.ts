import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { MapLocation } from './entities/map-location.entity';

@Injectable()
export class MapLocationsService extends BaseCrudService<MapLocation> {
  constructor(@InjectRepository(MapLocation) repository: Repository<MapLocation>) {
    super(repository);
  }

  async findPublic(filters: { modalidad?: string; tipo?: string }) {
    const locations = await this.repository.find({
      where: filters.tipo ? { type: filters.tipo, active: true } : { active: true },
      order: { id: 'ASC' },
    });
    return locations
      .filter((location) =>
        filters.modalidad
          ? (location.modalities ?? []).includes(filters.modalidad)
          : true,
      )
      .map((location) => ({
        id: Number(location.id),
        nombre: location.name,
        tipo: location.type,
        modalidades: location.modalities ?? [],
        lat: location.latitude,
        lng: location.longitude,
        localidad: location.locality,
        provincia: location.province,
        descripcion: location.description,
        contacto: location.contactInfo,
        web: location.websiteUrl,
      }));
  }
}
