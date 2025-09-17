import { Entity, Column, PrimaryGeneratedColumn,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import {Proyecto} from '../Proyecto/proyecto.etity'
import { Temas } from '../Tema/temas.entity';

@Entity('asignatura')
export class Asignatura{
  @PrimaryGeneratedColumn()
  idasignatura: number;
 @Column({ type: 'varchar', length: 500 })
  nombre: string;
 @Column({ type: 'number' })
  idproyecto: number;
 @Column({ type: 'bigint' })
  semestre: bigint;

 @ManyToOne(() => Proyecto, (proyecto) => proyecto.asignaturas)
@JoinColumn({ name: 'idproyecto' })
  proyecto: Proyecto;

 @OneToMany(() => Temas, (temas) => temas.asignatura)
   temas: Temas[];
}