// Importación de decoradores de la librería class-validator para validar los datos de entrada.
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// Definición de la clase CreateConversacionDto, que sirve como un DTO (Data Transfer Object) para estructurar y validar los datos al crear una conversación.
export class CreateConversacionDto {
  // Decoradores que aseguran que el campo 'titulo' sea una cadena de texto y no esté vacío.
  @IsString()
  @IsNotEmpty()
  titulo: string;

  // Decoradores que aseguran que el campo 'idusuario' sea una cadena de texto y no esté vacío.
  @IsString()
  @IsNotEmpty()
  idusuario: string;

  // Decoradores que aseguran que el campo 'idtemas' sea un número y no esté vacío.
  @IsNumber()
  @IsNotEmpty()
  idtemas: number;

  // Decoradores que aseguran que el campo 'idservicio' sea un número y no esté vacío.
  @IsNumber()
  @IsNotEmpty()
  idservicio: number;
}
