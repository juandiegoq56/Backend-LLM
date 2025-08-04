import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany,JoinColumn } from 'typeorm';
import {Asignatura}  from '../Asignatura/asignatura.entity';
import { Facultad } from '../Facultad/facultad.entity';
@Entity('proyecto')
export class Proyecto{
 @PrimaryGeneratedColumn()
 idproyecto : number;

 @Column({ type: 'varchar', length: 500 })
  nombre: string; 

 @Column({ type: 'bigint' })
  idfacultad: bigint; 
 
 @OneToMany(() => Asignatura, (asignatura) => asignatura.proyecto)
  asignaturas: Asignatura[];

 @ManyToOne(() => Facultad, (facultad) => facultad.proyecto)
 @JoinColumn({ name: 'idfacultad' })
  Facultad: Facultad;

}