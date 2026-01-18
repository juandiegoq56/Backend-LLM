// Importación de decoradores de TypeORM para definir la estructura de la entidad y sus relaciones con otras tablas.
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';

// Importación de la entidad relacionada para establecer la relación con la tabla de conversaciones.
import { Conversacion } from '../Conversacion/conversacion.entity';

// Decorador que indica que esta clase representa una tabla en la base de datos, con el nombre 'Usuario'.
@Entity('Usuario')
export class Usuario {
  // Decorador que define la columna como clave primaria autoincremental.
  @PrimaryGeneratedColumn()
  idusuario: number;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el nombre del usuario.
  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar el correo del usuario.
  @Column({ type: 'varchar', length: 500 })
  correo: string;

  // Decorador que define una columna de tipo varchar con una longitud máxima de 500 caracteres para almacenar la contraseña del usuario.
  @Column({ type: 'varchar', length: 500 })
  contrasena: string;

  // Decorador que define una columna de tipo date para almacenar la fecha de creación del usuario.
  @Column({ type: 'date' })
  fcreado: Date;

  // Decorador que establece una relación de uno a muchos con la entidad Conversacion, indicando que un usuario puede tener múltiples conversaciones asociadas.
  // Nota: Hay un error en el código original, ya que se referencia a 'Usuario' en lugar de 'Conversacion' como debería ser.
  @OneToMany(() => Conversacion, (conversacion) => conversacion.usuario)
  conversacion: Conversacion[];
}
