// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// Importación de las entidades relacionadas para establecer las relaciones entre tablas.
import { Temas } from '../Tema/temas.entity';
import { Mensajes } from '../Mensajes/mensajes.entity';
import { Usuario } from '../Usuario/usuario.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'Conversacion'.
@Entity('Conversacion')
export class Conversacion {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idconversacion: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el título de la conversación.
  @Column({ type: 'varchar', length: 500 })
  titulo: string;

  // Decorador que define una columna de tipo timestamp para la fecha de creación, con un valor por defecto del tiempo actual.
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fcreacion: Date;

  // Decorador que define una columna de tipo timestamp para la fecha del último mensaje, con un valor por defecto del tiempo actual.
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fultimo_mensaje: Date;

  // Decorador que define una columna de tipo varchar para almacenar el ID del usuario asociado a la conversación.
  @Column({ type: 'varchar' })
  idusuario: string;

  // Decorador que define una columna de tipo bigint para almacenar el ID del tema relacionado con la conversación.
  @Column({ type: 'bigint' })
  idtemas: bigint;

  // Decorador que define una columna de tipo bigint para almacenar el ID del servicio relacionado con la conversación.
  @Column({ type: 'bigint' })
  idservicio: bigint;

  // Decorador que establece una relación de muchos a uno con la entidad Temas, indicando que muchas conversaciones pueden estar relacionadas con un solo tema.
  // También especifica que la relación se une a través de la columna 'idtemas' y que se elimina en cascada si el tema es eliminado.
  @ManyToOne(() => Temas, (tema) => tema.conversacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idtemas' })
  tema: Temas;

  // Decorador que establece una relación de muchos a uno con la entidad Usuario, indicando que muchas conversaciones pueden estar relacionadas con un solo usuario.
  // También especifica que la relación se une a través de la columna 'idusuario' y que se elimina en cascada si el usuario es eliminado.
  @ManyToOne(() => Usuario, (usuario) => usuario.conversacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  // Decorador que establece una relación de uno a muchos con la entidad Mensajes, indicando que una conversación puede tener múltiples mensajes asociados.
  @OneToMany(() => Mensajes, (mensaje) => mensaje.conversacion)
  mensaje: Mensajes[];
}
