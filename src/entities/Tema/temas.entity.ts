// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// Importación de las entidades relacionadas para establecer las relaciones con las tablas de asignaturas y conversaciones.
import { Asignatura } from '../Asignatura/asignatura.entity';
import { Conversacion } from '../Conversacion/conversacion.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'temas'.
@Entity('temas')
export class Temas {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idtemas: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el nombre del tema.
  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  // Decorador que define una columna de tipo bigint para almacenar el ID del tema padre, permitiendo una estructura jerárquica de temas.
  @Column({ type: 'bigint' })
  tema_padre_id: bigint;

  // Decorador que define una columna de tipo bigint para almacenar el ID de la asignatura a la que pertenece el tema.
  @Column({ type: 'bigint' })
  idasignatura: bigint;

  // Decorador que establece una relación de muchos a uno con la entidad Asignatura, indicando que muchos temas pueden pertenecer a una sola asignatura.
  // También especifica que la relación se une a través de la columna 'idasignatura'.
  @ManyToOne(() => Asignatura, (asignatura) => asignatura.temas)
  @JoinColumn({ name: 'idasignatura' })
  asignatura: Asignatura;

  // Decorador que establece una relación de muchos a uno con la misma entidad Temas, permitiendo una estructura jerárquica donde un tema puede tener un tema padre.
  // También especifica que la relación se une a través de la columna 'tema_padre_id'.
  @ManyToOne(() => Temas, (temas) => temas.temas)
  @JoinColumn({ name: 'tema_padre_id' })
  temas: Temas;

  // Decorador que establece una relación de uno a muchos con la entidad Conversacion, indicando que un tema puede tener múltiples conversaciones asociadas.
  @OneToMany(() => Conversacion, (conversacion) => conversacion.tema)
  conversacion: Conversacion[];
}
