import { Entity, Column, PrimaryGeneratedColumn,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import { Temas } from '../Tema/temas.entity';
import { Mensajes } from '../Mensajes/mensajes.entity';
import { Usuario } from '../Usuario/usuario.entity';
@Entity('Conversacion')
export class Conversacion {
  @PrimaryGeneratedColumn()
  idconversacion: number;

  @Column({ type: 'varchar', length: 500 })
  titulo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fcreacion: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fultimo_mensaje: Date;

  @Column({ type: 'bigint' })
  idusuario: bigint;

  @Column({ type: 'bigint' })
  idtemas: bigint;

  @ManyToOne(() => Temas, (tema) => tema.conversacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idtemas' })
  tema: Temas;
  
  @ManyToOne(() => Usuario, (usuario) => usuario.conversacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  @OneToMany(() => Mensajes, (Mensaje) => Mensaje.conversacion)
  mensaje: Mensajes[];
}

 
