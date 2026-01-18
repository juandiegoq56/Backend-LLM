// Importación de decoradores de la librería class-validator para validar los datos de entrada.
import { IsIn, IsNotEmpty, IsString, IsNumber } from 'class-validator';

// Definición de la clase CreateMensajeDto, que sirve como un DTO (Data Transfer Object) para estructurar y validar los datos al crear un mensaje.
export class CreateMensajeDto {
  // Decorador que asegura que el campo 'emisor' solo pueda tomar los valores 'user' o 'agent', con un mensaje de error personalizado si no se cumple.
  @IsIn(['user', 'agent'], { message: 'El emisor debe ser "user" o "agent"' })
  emisor: 'user' | 'agent';

  // Decoradores que aseguran que el campo 'contenido' sea una cadena de texto y no esté vacío, con un mensaje de error personalizado.
  @IsString()
  @IsNotEmpty({ message: 'El contenido del mensaje no puede estar vacío' })
  contenido: string;

  // Decorador que asegura que el campo 'idconversacion' sea un número, con un mensaje de error personalizado si no es válido.
  @IsNumber({}, { message: 'El id de la conversación debe ser un número válido' })
  idconversacion: number;
}
