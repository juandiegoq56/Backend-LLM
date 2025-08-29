import { Injectable,NotFoundException,BadRequestException   } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { CreateMensajeDto } from 'src/dto/create-mensaje.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensajes)
    private readonly mensajesRepository: Repository<Mensajes>,
  ) {}

  // ✅ Obtener todos los mensajes
   async findAllmensaje(): Promise<any[]> {
      const mensaje = await this.mensajesRepository.find({
         relations: ['conversacion'],
      });
      return mensaje.map((msg) => ({
        idmensaje:msg.idmensajes,
        emisor: msg.emisor,
        contenido: msg.contenido,  
        fcreado: msg.fcreado,
        idconversacion: msg.idconversacion, // asumiendo que en Usuario tienes "username"
        
      }));
    }
  
    async findOnemensaje(id: number): Promise<any> {
   const mensajes = await this.mensajesRepository.find({
    where: { 
      conversacion: { idconversacion: id }  // 👈 se busca por la relación
    },
    relations: ['conversacion'],
    
  });

  if (!mensajes || mensajes.length === 0) {
    throw new NotFoundException(
      `No existen mensajes para la conversación `,
    );
  }

  return mensajes.map((msg) => ({
    idmensaje: msg.idmensajes,
    emisor: msg.emisor,
    contenido: msg.contenido,
    fcreado: msg.fcreado,
    idconversacion: msg.idconversacion, // 👈 se extrae el id desde la relación
  }));
}

async create(createMensajeDto: CreateMensajeDto): Promise<any> {
    const { emisor, contenido, idconversacion } = createMensajeDto;
    const now = moment().tz('America/Bogota').toDate();
    // Validación manual adicional si la quieres
    if (!['user', 'agent'].includes(emisor)) {
      throw new BadRequestException('El emisor debe ser "user" o "agent"');
    }

    const nuevoMensaje = this.mensajesRepository.create({
      emisor,
      contenido,
      fcreado: now,
      idconversacion: idconversacion, 
    });

    const guardado = await this.mensajesRepository.save(nuevoMensaje);

    return {
      idmensajes: guardado.idmensajes,
      emisor: guardado.emisor,
      contenido: guardado.contenido,
      idconversacion: Number(guardado.idconversacion),
    };
  }
  }

  
  

