import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany,JoinColumn } from 'typeorm';
import { Asignatura } from '../Asignatura/asignatura.entity';
import { Conversacion } from '../Conversacion/conversacion.entity';

@Entity('temas')
export class Temas {
  @PrimaryGeneratedColumn()
  idtemas: number;

  @Column({ type: 'varchar', length: 500 })
  nombre: string;

  @Column({ type: 'bigint' })
  tema_padre_id: bigint;

  @Column({ type: 'bigint' })
  idasignatura: bigint;

  @ManyToOne(() => Asignatura, (asignatura) => asignatura.temas)
  @JoinColumn({ name: 'idasignatura' })
  asignatura: Asignatura;

  @ManyToOne(() => Temas, (temas) => temas.temas)
  @JoinColumn({ name: 'tema_padre_id' })
  temas: Temas;

  @OneToMany(() => Conversacion, (conversacion) => conversacion.tema)
  conversacion: Conversacion[];
}
