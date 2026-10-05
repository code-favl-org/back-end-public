import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

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

  async create(input: Record<string, unknown>): Promise<Entity> {
    const entity = this.repository.create(this.sanitize(input) as DeepPartial<Entity>);
    return this.repository.save(entity);
  }

  async update(id: string, input: Record<string, unknown>): Promise<Entity> {
    const entity = await this.findById(id);
    Object.assign(entity, this.sanitize(input));
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({
      id: this.parseId(id),
    } as unknown as FindOptionsWhere<Entity>);
    if (result.affected !== 1) throw new NotFoundException('Resource not found.');
  }

  protected sanitize(input: Record<string, unknown>): Record<string, unknown> {
    const writableColumns = new Map(
      this.repository.metadata.columns
        .filter(
          (column) =>
            !column.isPrimary &&
            !column.isCreateDate &&
            !column.isUpdateDate &&
            column.propertyName !== 'passwordHash',
        )
        .map((column) => [column.propertyName, column]),
    );
    const sanitized: Record<string, unknown> = {};

    for (const [property, value] of Object.entries(input)) {
      const column = writableColumns.get(property);
      if (!column) {
        throw new BadRequestException(`Field '${property}' cannot be written.`);
      }
      if (value === null) {
        if (!column.isNullable) {
          throw new BadRequestException(`Field '${property}' cannot be null.`);
        }
        sanitized[property] = null;
        continue;
      }
      this.validateColumnValue(property, value, column.type, column.length);
      sanitized[property] = value;
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestException('At least one writable field is required.');
    }
    return sanitized;
  }

  private validateColumnValue(
    property: string,
    value: unknown,
    columnType: string | Function,
    length: string,
  ): void {
    const type = typeof columnType === 'string' ? columnType : columnType.name;
    if (['simple-json', 'json'].includes(type)) return;

    if (['tinyint', 'boolean', 'bool'].includes(type)) {
      if (![true, false, 0, 1].includes(value as boolean | number)) {
        throw new BadRequestException(`Field '${property}' must be boolean.`);
      }
      return;
    }
    if (['int', 'integer', 'bigint', 'decimal', 'float', 'double'].includes(type)) {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BadRequestException(`Field '${property}' must be numeric.`);
      }
      return;
    }
    if (['date', 'datetime', 'timestamp'].includes(type)) {
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        throw new BadRequestException(`Field '${property}' must be a valid date string.`);
      }
      return;
    }
    if (typeof value !== 'string') {
      throw new BadRequestException(`Field '${property}' must be a string.`);
    }
    const maxLength = Number(length);
    if (maxLength > 0 && value.length > maxLength) {
      throw new BadRequestException(`Field '${property}' exceeds ${maxLength} characters.`);
    }
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('ID must be a positive safe integer.');
    }
    return parsed;
  }
}