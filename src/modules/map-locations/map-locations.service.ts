import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { MapLocation } from './entities/map-location.entity';

interface CndSite {
  nombre: string;
  provincia: string;
  latitud: string;
  longitud: string;
  description: string;
}

const ALL_MODALITIES = ['parapente', 'paramotor', 'ala-delta'];

@Injectable()
export class MapLocationsService extends BaseCrudService<MapLocation> {
  private readonly logger = new Logger(MapLocationsService.name);

  constructor(
    @InjectRepository(MapLocation) repository: Repository<MapLocation>,
  ) {
    super(repository);
  }

  async findPublic(filters: { modalidad?: string; tipo?: string }) {
    let cndSites: CndSite[] = [];
    try {
      cndSites = await this.findSitiosCnd();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudieron consultar sitios externos de CND: ${message}`,
      );
    }

    const locations = await this.repository.find({
      where: filters.tipo
        ? { type: filters.tipo, active: true }
        : { active: true },
      order: { id: 'ASC' },
    });
    const localLocations = locations
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

    const externalLocations = cndSites
      .map((site, index) => ({
        id: `cnd-${index}`,
        nombre: site.nombre,
        tipo: 'sitio',
        modalidades: ALL_MODALITIES,
        lat: Number(site.latitud),
        lng: Number(site.longitud),
        localidad: '',
        provincia: site.provincia,
        descripcion: site.description,
        contacto: null,
        web: null,
      }))
      .filter(
        (location) =>
          Number.isFinite(location.lat) && Number.isFinite(location.lng),
      )
      .filter((location) => !filters.tipo || filters.tipo === location.tipo)
      .filter(
        (location) =>
          !filters.modalidad ||
          filters.modalidad === 'todos' ||
          location.modalidades.includes(filters.modalidad),
      );

    return [...localLocations, ...externalLocations];
  }

  private async findSitiosCnd(): Promise<CndSite[]> {
    const response = await fetch(
      'https://cnd.com.ar/favl/api_favl_sitios.php/VFZSSmVrOVVSVEpOVVQwOQ==/sitios',
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('La API externa devolvió un formato inesperado.');
    }
    this.logger.log(
      `Respuesta recibida de CND: ${JSON.stringify(data, null, 2)}`,
    );
    const items = data as unknown[];
    return items.map((item: unknown, index) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        !('nombre' in item) ||
        typeof item.nombre !== 'string' ||
        !('provincia' in item) ||
        typeof item.provincia !== 'string' ||
        !('latitud' in item) ||
        (typeof item.latitud !== 'string' &&
          typeof item.latitud !== 'number') ||
        !('longitud' in item) ||
        (typeof item.longitud !== 'string' &&
          typeof item.longitud !== 'number') ||
        !('description' in item) ||
        typeof item.description !== 'string'
      ) {
        throw new Error(
          `El sitio externo en la posición ${index} tiene un formato inválido.`,
        );
      }

      return {
        nombre: item.nombre,
        provincia: item.provincia,
        latitud: String(item.latitud),
        longitud: String(item.longitud),
        description: item.description,
      };
    });
  }
}
