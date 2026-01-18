// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

// Importación de la entidad relacionada para establecer la relación con la tabla de proyectos.
import { Proyecto } from '../Proyecto/proyecto.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'facultad'.
@Entity('facultad')
export class Facultad {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idfacultad: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el nombre de la facultad.
  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  // Decorador que establece una relación de uno a muchos con la entidad Proyecto, indicando que una facultad puede tener múltiples proyectos asociados.
  @OneToMany(() => Proyecto, (proyecto) => proyecto.Facultad)
  proyecto: Proyecto[];
}
