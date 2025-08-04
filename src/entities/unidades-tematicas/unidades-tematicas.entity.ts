import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('unidades_tematicas') // Este debe coincidir con el nombre de la tabla en la base de datos
export class UnidadesTematicas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  facultad: string;

  @Column({ type: 'varchar', length: 100 })
  proyecto: string;

  @Column({ type: 'varchar', length: 100 })
  asignatura: string;

  @Column({ type: 'varchar', length: 255 })
  unidad: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_unidad: string;

  @Column({ type: 'text' }) // Asegúrate de que coincida con el tipo en la base de datos
  tema: string;
}



