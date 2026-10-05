import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import type { ObjectLiteral } from 'typeorm';
import { BaseCrudService } from '../database/base-crud.service';

@ApiBearerAuth('session-bearer')
export abstract class BaseCrudController<Entity extends ObjectLiteral> {
  protected constructor(protected readonly service: BaseCrudService<Entity>) {}

  @Get()
  @ApiOperation({ summary: 'List resources (requires resource.read)' })
  @ApiResponse({ status: 200, description: 'Resource list.' })
  findAll(): unknown {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID (requires resource.read)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Resource found.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(String(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create resource (requires resource.create)' })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 201, description: 'Resource created.' })
  create(@Body() input: Record<string, unknown>) {
    return this.service.create(input);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resource (requires resource.update)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { type: 'object', additionalProperties: true } })
  @ApiResponse({ status: 200, description: 'Resource updated.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: Record<string, unknown>,
  ) {
    return this.service.update(String(id), input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete resource (requires resource.delete)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Resource deleted.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(String(id));
  }
}