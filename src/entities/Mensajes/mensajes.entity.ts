// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

// Importación de la entidad relacionada para establecer la relación con la tabla de conversaciones.
import { Conversacion } from '../Conversacion/conversacion.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'Mensajes'.
@Entity('Mensajes')
export class Mensajes {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idmensajes: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el emisor del mensaje.
  @Column({ type: 'varchar', length: 500 })
  emisor: string;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el contenido del mensaje.
  @Column({ type: 'varchar', length: 500 })
  contenido: string;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el embedding del mensaje.
  @Column({ type: 'varchar', length: 500 })
  embedding: string;

  // Decorador que define una columna de tipo date para almacenar la fecha de creación del mensaje.
  @Column({ type: 'date' })
  fcreado: Date;

  // Decorador que define una columna de tipo entero para almacenar el ID de la conversación a la que pertenece el mensaje.
  @Column({ type: 'int' })
  idconversacion: number;

  // Decorador que define una columna de tipo bigint que puede ser nula, para indicar si el mensaje es un formulario o no.
  @Column({ type: 'bigint', nullable: true })
  isform: number | null;

  // Decorador que establece una relación de muchos a uno con la entidad Conversacion, indicando que muchos mensajes pueden pertenecer a una sola conversación.
  // También especifica que la relación se une a través de la columna 'idconversacion' y que se elimina en cascada si la conversación es eliminada.
  @ManyToOne(() => Conversacion, (conversacion) => conversacion.mensaje, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idconversacion' })
  conversacion: Conversacion;
}
