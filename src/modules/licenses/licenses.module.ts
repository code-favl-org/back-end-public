import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { LicensesService } from './licenses.service';
import { LicensesController } from './licenses.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([License])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: LicensesService, useValue: {} }] : [LicensesService];

@Module({ imports: persistence, controllers: [LicensesController], providers, exports: [LicensesService] })
export class LicensesModule {}
