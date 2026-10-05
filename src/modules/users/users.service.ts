import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) { }

  async findAll() {
    const users = await this.users.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async findById(id: number) {
    const user = await this.users.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.toSafeUser(user);
  }

  async create(input: CreateUserDto) {
    const user = this.users.create({
      usuario: input.usuario,
      email: input.email,
      passwordHash: await hash(input.password, 12),
      role: input.role,
      activo: input.activo ?? true,
    });

    return this.toSafeUser(await this.users.save(user));
  }

  async update(id: number, input: UpdateUserDto) {
    const user = await this.users.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (input.usuario !== undefined) {
      user.usuario = input.usuario;
    }

    if (input.email !== undefined) {
      user.email = input.email;
    }

    if (input.role !== undefined) {
      user.role = input.role;
    }

    if (input.activo !== undefined) {
      user.activo = input.activo;
    }

    if (input.password !== undefined) {
      user.passwordHash = await hash(input.password, 12);
    }

    return this.toSafeUser(await this.users.save(user));
  }

  async remove(id: number): Promise<void> {
    const user = await this.users.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    user.activo = false;

    await this.users.save(user);
  }

  private toSafeUser(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}