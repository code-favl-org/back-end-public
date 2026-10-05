import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'demo.admin' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({
    description: 'Contraseña temporal de demo local; no usar en producción.',
    example: 'nBHxHAcQ86iiMCppIcf4MgxuUUcRuzfK',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'one-time-reset-token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'new-password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshSessionDto {
  @ApiProperty({
    required: false,
    description: 'Solo Bearer/Android; web usa la cookie favl_refresh.',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}