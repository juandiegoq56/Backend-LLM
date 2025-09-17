import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from '../entities/Conversacion/conversacion.entity';
import { Usuario } from 'src/entities/Usuario/usuario.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import { MoodleService } from './user.service';
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
    private moodleService:MoodleService,
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
      usuario: conv.idusuario, // asumiendo que en Usuario tienes "username"
      tema: conv.tema ? conv.tema.nombre : null, // asumiendo que en Temas tienes "nombre"
    }));
  }
  
  // Obtener una conversación por ID
 async findByUsuario(id: string, idservice: bigint): Promise<any[]> {
  const conversaciones = await this.conversacionRepository.find({

    where: { idusuario: id, idservicio: idservice},
    relations: ['tema'], // importante si quieres traer el tema
    order: {
      fultimo_mensaje: 'DESC',
    },
  });

  return conversaciones.map((conv) => ({
    idconversacion: conv.idconversacion,
    titulo: conv.titulo,
    fcreacion: conv.fcreacion,
    fultimo_mensaje: conv.fultimo_mensaje,
    usuario: conv.idusuario,
    tema: conv.tema ? conv.tema.nombre : null,
    idservice: conv.idservicio
  }));
}




async create(
  titulo: string,
  usuarioCorreo: string,  // 👈 ahora recibe correo
  temaId: number,
  idservice: number
): Promise<Conversacion> {
  

  const tema = await this.temaRepository.findOne({
    where: { idtemas: temaId },
  });

  if (!tema) {
    throw new Error('Tema no encontrado');
  }

  // 4. Obtener fecha/hora actual en Bogotá
  const now = moment().tz('America/Bogota').toDate();

  // 5. Crear conversación
  const conversacion = new Conversacion();
  conversacion.titulo = titulo;
  conversacion.fcreacion = now;
  conversacion.fultimo_mensaje = now;
  conversacion.idusuario = usuarioCorreo;   // este sí viene de tu BD
  conversacion.idtemas = BigInt(tema.idtemas);
  conversacion.tema = tema;
  conversacion.idservicio = BigInt(idservice);

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
