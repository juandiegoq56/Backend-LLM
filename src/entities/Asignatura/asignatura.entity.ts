// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// Importación de las entidades relacionadas para establecer las relaciones entre tablas.
import { Proyecto } from '../Proyecto/proyecto.entity';
import { Temas } from '../Tema/temas.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'asignatura'.
@Entity('asignatura')
export class Asignatura {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idasignatura: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el nombre de la asignatura.
  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  // Decorador que define una columna de tipo entero para almacenar el ID del proyecto al que pertenece la asignatura.
  @Column({ type: 'int' })
  idproyecto: number;

  // Decorador que define una columna de tipo bigint para almacenar el semestre de la asignatura.
  @Column({ type: 'bigint' })
  semestre: bigint;

  // Decorador que establece una relación de muchos a uno con la entidad Proyecto, indicando que muchas asignaturas pueden pertenecer a un solo proyecto.
  // También especifica que la relación se une a través de la columna 'idproyecto'.
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.asignaturas)
  @JoinColumn({ name: 'idproyecto' })
  proyecto: Proyecto;

  // Decorador que establece una relación de uno a muchos con la entidad Temas, indicando que una asignatura puede tener múltiples temas asociados.
  @OneToMany(() => Temas, (temas) => temas.asignatura)
  temas: Temas[];
}
