import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { CreateMensajeDto } from 'src/dto/create-mensaje.dto';
import * as moment from 'moment-timezone';
import fetch from 'node-fetch';
import { classifyFormFlag } from './clasificador.service';
import * as dotenv from 'dotenv';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensajes)
    private readonly mensajesRepository: Repository<Mensajes>,
  ) {}

  // ✅ Obtener todos los mensajes
  async findAllmensaje(): Promise<any[]> {
    const mensajes = await this.mensajesRepository.find({
      relations: ['conversacion'],
    });

    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  }

  // ✅ Buscar mensajes por ID de conversación
  async findOnemensaje(id: number): Promise<any[]> {
    const mensajes = await this.mensajesRepository.find({
      where: { conversacion: { idconversacion: id } },
      relations: ['conversacion'],
      order: { fcreado: 'DESC' },
    });

    if (!mensajes || mensajes.length === 0) {
      throw new NotFoundException(
        `No existen mensajes para la conversación con ID ${id}`,
      );
    }

    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  }

  // ✅ Generar Embedding usando Ollama
  private async generarEmbedding(contenido: string): Promise<number[]> {
    const embeddingUrl = process.env.EMBEDDING;

     if (!embeddingUrl) {
    throw new InternalServerErrorException(
      'La variable de entorno EMBEDDING no está definida. ' +
      'Agrega la variable en tu archivo .env',
    );
  }
    try {
      const response = await fetch(embeddingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: contenido,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al generar embedding: ${response.statusText}`);
      }

      const data = (await response.json()) as { embedding: number[] };
      return data.embedding;
    } catch (error) {
      console.error('❌ Error generando embedding:', error);
      throw new InternalServerErrorException(
        'Error al generar el embedding con Ollama',
      );
    }
  }

  // Crear mensaje y generar embedding
  async create(createMensajeDto: CreateMensajeDto): Promise<any> {
    const { emisor, contenido, idconversacion } = createMensajeDto;
    const now = moment().tz('America/Bogota').toDate();

    if (!['user', 'agent'].includes(emisor)) {
      throw new BadRequestException('El emisor debe ser "user" o "agent"');
    }
    // Clasificador

    const isform1 = await classifyFormFlag(contenido);
    console.log(isform1)
    console.log("linea 107")
    //  Generar embedding con Ollama
    const embedding = await this.generarEmbedding(contenido);  
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
  console.log(formatted)
    //  Crear mensaje con embedding serializado
    const nuevoMensaje = this.mensajesRepository.create({
      emisor,
      contenido,
      embedding: JSON.stringify(embedding),
      fcreado: formatted,
      idconversacion: idconversacion,
      isform : isform1,
    });

    const guardado = await this.mensajesRepository.save(nuevoMensaje);

    return {
      idmensajes: guardado.idmensajes,
      emisor: guardado.emisor,
      contenido: guardado.contenido,
      idconversacion: Number(guardado.idconversacion),
      isform: guardado.isform,
      fcreado:guardado.fcreado
    };
  }
}
