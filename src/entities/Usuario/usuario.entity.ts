import { Entity, Column, PrimaryGeneratedColumn,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import { Conversacion } from '../Conversacion/conversacion.entity';

@Entity('Usuario')
export class Usuario {

  @PrimaryGeneratedColumn()
  idusuario: number;

  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  @Column({ type: 'varchar', length: 500 })
   correo: string;
  @Column({ type: 'varchar', length: 500 })
   contrasena: string;

  @Column({ type: 'date' })
  fcreado: Date;

  @OneToMany(() => Usuario, (Usuario) => Usuario.conversacion)
    conversacion: Conversacion[];

}

 
