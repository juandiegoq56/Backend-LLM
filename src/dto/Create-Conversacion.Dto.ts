import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateConversacionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  idusuario: string;

  

  @IsNumber()
  @IsNotEmpty()
  idtemas: number;
  idservicio: number;
}
