import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

@Injectable()
export class BaseCrudService<Entity extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<Entity>) {}

  findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id: this.parseId(id) } as unknown as FindOptionsWhere<Entity>,
    });
    if (!entity) throw new NotFoundException('Resource not found.');
    return entity;
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('ID must be a positive safe integer.');
    }
    return parsed;
  }
}
