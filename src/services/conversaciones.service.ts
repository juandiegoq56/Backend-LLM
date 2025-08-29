import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from '../entities/Conversacion/conversacion.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import * as moment from 'moment-timezone';
@Injectable()
export class ConversacionService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Temas)
    private temaRepository: Repository<Temas>,
  ) {}

  // Obtener todas las conversaciones
   async findAll(): Promise<any[]> {
    const conversaciones = await this.conversacionRepository.find({
      relations: ['tema', 'usuario'],
      order: {
      fultimo_mensaje: 'DESC', // ordena de más reciente a más antiguo
    },
    });

    return conversaciones.map((conv) => ({
      idconversacion: conv.idconversacion,
      titulo: conv.titulo,
      fcreacion: conv.fcreacion,  
      fultimo_mensaje: conv.fultimo_mensaje,
      usuario: conv.usuario ? conv.usuario.nombre : null, // asumiendo que en Usuario tienes "username"
      tema: conv.tema ? conv.tema.nombre : null, // asumiendo que en Temas tienes "nombre"
    }));
  }

  // Obtener una conversación por ID
  async findOne(id: number): Promise<Conversacion | null> {
  return await this.conversacionRepository.findOne({
    where: { idconversacion: id },
    relations: ['tema', 'usuario', 'mensaje'],
  });
}

async create(
  titulo: string,
  usuarioId: number,
  temaId: number,
): Promise<Conversacion> {
  const usuario = await this.usuarioRepository.findOne({
    where: { idusuario: usuarioId },
  });
  const tema = await this.temaRepository.findOne({
    where: { idtemas: temaId },
  });

  if (!usuario || !tema) {
    throw new Error('Usuario o tema no encontrado');
  }

  // Obtener fecha/hora actual en Bogotá
  const now = moment().tz('America/Bogota').toDate();

  const conversacion = new Conversacion();
  conversacion.titulo = titulo;
  conversacion.fcreacion = now;
  conversacion.fultimo_mensaje = now;
  conversacion.idusuario = BigInt(usuario.idusuario);
  conversacion.idtemas = BigInt(tema.idtemas);
  conversacion.usuario = usuario;
  conversacion.tema = tema;

  return this.conversacionRepository.save(conversacion);
}

async update(id: string): Promise<void> {
  const now = new Date();

  // Ajuste a zona horaria Bogotá (UTC-5)
  const bogotaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Bogota" })
  );

  const year = bogotaTime.getFullYear();
  const month = String(bogotaTime.getMonth() + 1).padStart(2, "0");
  const day = String(bogotaTime.getDate()).padStart(2, "0");
  const hours = String(bogotaTime.getHours()).padStart(2, "0");
  const minutes = String(bogotaTime.getMinutes()).padStart(2, "0");
  const seconds = String(bogotaTime.getSeconds()).padStart(2, "0");

  const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  await this.conversacionRepository.update(id, {
    fultimo_mensaje: formatted,
  });
}


}
