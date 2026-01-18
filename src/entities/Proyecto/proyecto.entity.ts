// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

// Importación de las entidades relacionadas para establecer las relaciones con las tablas de asignaturas y facultades.
import { Asignatura } from '../Asignatura/asignatura.entity';
import { Facultad } from '../Facultad/facultad.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'proyecto'.
@Entity('proyecto')
export class Proyecto {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idproyecto: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el nombre del proyecto.
  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  // Decorador que define una columna de tipo bigint para almacenar el ID de la facultad a la que pertenece el proyecto.
  @Column({ type: 'bigint' })
  idfacultad: bigint;

  // Decorador que establece una relación de uno a muchos con la entidad Asignatura, indicando que un proyecto puede tener múltiples asignaturas asociadas.
  @OneToMany(() => Asignatura, (asignatura) => asignatura.proyecto)
  asignaturas: Asignatura[];

  // Decorador que establece una relación de muchos a uno con la entidad Facultad, indicando que muchos proyectos pueden pertenecer a una sola facultad.
  // También especifica que la relación se une a través de la columna 'idfacultad'.
  @ManyToOne(() => Facultad, (facultad) => facultad.proyecto)
  @JoinColumn({ name: 'idfacultad' })
  Facultad: Facultad;
}
