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
      order: { fcreado: 'ASC' },
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

  // ✅ Crear mensaje y generar embedding
  async create(createMensajeDto: CreateMensajeDto): Promise<any> {
    const { emisor, contenido, idconversacion } = createMensajeDto;
    const now = moment().tz('America/Bogota').toDate();

    if (!['user', 'agent'].includes(emisor)) {
      throw new BadRequestException('El emisor debe ser "user" o "agent"');
    }

    // 1️⃣ Generar embedding con Ollama
    const embedding = await this.generarEmbedding(contenido);

    // 2️⃣ Crear mensaje con embedding serializado
    const nuevoMensaje = this.mensajesRepository.create({
      emisor,
      contenido,
      embedding: JSON.stringify(embedding),
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
