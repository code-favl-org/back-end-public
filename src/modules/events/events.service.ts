import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { publicAssetUrl } from '../../common/public-asset-url';
import { EventRegistration } from '../event-registrations/entities/event-registration.entity';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService extends BaseCrudService<Event> {
  constructor(
    @InjectRepository(Event) repository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrations: Repository<EventRegistration>,
  ) {
    super(repository);
  }

  async findPublic(filters: { modalidad?: string; estado?: string }) {
    const query = this.repository.createQueryBuilder('event');
    if (filters.modalidad) {
      query.andWhere('event.modalityCode = :modality', {
        modality: filters.modalidad,
      });
    }
    if (filters.estado) {
      query.andWhere('event.status = :status', { status: filters.estado });
    }
    const events = await query
      .orderBy('event.startDate', 'DESC')
      .addOrderBy('event.id', 'DESC')
      .getMany();
    const counts = await this.registrations
      .createQueryBuilder('registration')
      .select('registration.eventId', 'eventId')
      .addSelect('COUNT(registration.id)', 'count')
      .where(
        'registration.status IS NULL OR registration.status <> :cancelled',
        {
          cancelled: 'cancelled',
        },
      )
      .groupBy('registration.eventId')
      .getRawMany<{ eventId: string; count: string }>();
    const registrationsByEvent = new Map(
      counts.map((row) => [Number(row.eventId), Number(row.count)]),
    );

    return events.map((event) =>
      this.toPublicEvent(
        event,
        registrationsByEvent.get(Number(event.id)) ?? 0,
      ),
    );
  }

  async findPublicByIdentifier(identifier: string) {
    let event = await this.repository.findOne({ where: { slug: identifier } });
    if (!event && /^\d+$/.test(identifier)) {
      event = await this.repository.findOne({
        where: { id: Number(identifier) },
      });
    }
    if (!event) throw new NotFoundException('Evento no encontrado.');

    const registrations = await this.registrations
      .createQueryBuilder('registration')
      .where('registration.eventId = :eventId', { eventId: Number(event.id) })
      .andWhere(
        '(registration.status IS NULL OR registration.status <> :cancelled)',
        {
          cancelled: 'cancelled',
        },
      )
      .getCount();

    return this.toPublicEvent(event, registrations);
  }

  private toPublicEvent(event: Event, registrations: number) {
    return {
      id: Number(event.id),
      slug: event.slug,
      titulo: event.title,
      modalidad: event.modalityCode,
      tags: event.tags ?? [],
      tipo: event.type,
      estado: event.status,
      fechaInicio: event.startDate,
      fechaFin: event.endDate,
      lugar: event.venue,
      provincia: event.province,
      cupo: event.capacity,
      inscriptos: registrations,
      imagen: publicAssetUrl(event.imageUrl),
      descripcion: event.description,
      organizaLink: event.organizerUrl,
    };
  }
}
