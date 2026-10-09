import { Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import type { ObjectLiteral } from 'typeorm';
import { BaseCrudService } from '../database/base-crud.service';

export abstract class BaseCrudController<Entity extends ObjectLiteral> {
  protected constructor(protected readonly service: BaseCrudService<Entity>) {}

  @Get()
  @ApiOperation({ summary: 'List resources' })
  @ApiResponse({ status: 200, description: 'Resource list.' })
  findAll(): unknown {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Resource found.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(String(id));
  }
}
