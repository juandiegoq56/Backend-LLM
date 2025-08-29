import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateConversacionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsNumber()
  @IsNotEmpty()
  idusuario: number;

  @IsNumber()
  @IsNotEmpty()
  idtemas: number;
}
