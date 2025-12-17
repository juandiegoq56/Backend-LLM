import { Entity, Column, PrimaryGeneratedColumn,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import { Conversacion } from '../Conversacion/conversacion.entity';

@Entity('Mensajes')
export class Mensajes {
  @PrimaryGeneratedColumn()
  idmensajes: number;

  @Column({ type: 'varchar', length: 500 })
  emisor: string;

  @Column({ type: 'varchar', length: 500 })
   contenido: string;

  @Column({ type: 'varchar', length: 500 })
  embedding : string;

  @Column({ type: 'date' })
  fcreado: Date;


  @Column({ type: 'number' })
  idconversacion: Number;


  @ManyToOne(() => Conversacion, (conversacion) => conversacion.mensaje, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idconversacion' })
  conversacion: Conversacion[];

}

 
