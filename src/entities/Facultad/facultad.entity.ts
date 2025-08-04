import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Proyecto } from '../Proyecto/proyecto.etity';

@Entity('facultad')
export class Facultad{
 @PrimaryGeneratedColumn()
 idfacultad : number;

 @Column({ type: 'varchar', length: 500 })
  nombre: string; 
 
 @OneToMany(() => Proyecto, (proyecto) => proyecto.Facultad)
  proyecto: Proyecto[];

}