// src/mensajes/dto/create-mensaje.dto.ts
import { IsIn, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateMensajeDto {
  @IsIn(['user', 'agent'], { message: 'El emisor debe ser "user" o "agent"' })
  emisor: 'user' | 'agent';

  @IsString()
  @IsNotEmpty()
  contenido: string;

  @IsNumber()
  idconversacion: number;
}
