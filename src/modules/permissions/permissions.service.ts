import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService extends BaseCrudService<Permission> {
  constructor(@InjectRepository(Permission) repository: Repository<Permission>) {
    super(repository);
  }
}
