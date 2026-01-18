// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Importación de la entidad Mensajes y el DTO para crear mensajes.
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { CreateMensajeDto } from 'src/dto/create-mensaje.dto';

// Importación de librerías externas para manejar fechas y peticiones HTTP.
import * as moment from 'moment-timezone';
import fetch from 'node-fetch';

// Importación de la función para clasificar si un mensaje solicita un formulario.
import { classifyFormFlag } from './clasificador.service';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class MensajesService {
  // Constructor que inyecta el repositorio de la entidad Mensajes para interactuar con la base de datos.
  constructor(
    @InjectRepository(Mensajes)
    private readonly mensajesRepository: Repository<Mensajes>,
  ) {}

  // Método para obtener todos los mensajes con sus relaciones.
  async findAllmensaje(): Promise<any[]> {
    // Busca todos los mensajes, incluyendo la relación con la conversación.
    const mensajes = await this.mensajesRepository.find({
      relations: ['conversacion'],
    });

    // Mapea los mensajes para retornar solo los campos deseados.
    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  }

  // Método para buscar mensajes por ID de conversación.
  async findOnemensaje(id: number): Promise<any[]> {
    // Busca mensajes asociados a una conversación específica, ordenados por fecha de creación descendente.
    const mensajes = await this.mensajesRepository.find({
      where: { conversacion: { idconversacion: id } },
      relations: ['conversacion'],
      order: { fcreado: 'ASC' },
    });

    // Lanza una excepción si no se encuentran mensajes para la conversación.
    if (!mensajes || mensajes.length === 0) {
      throw new NotFoundException(
        `No existen mensajes para la conversación con ID ${id}`,
      );
    }

    // Mapea los mensajes para retornar solo los campos deseados.
    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  }

  // Método privado para generar un embedding a partir de un contenido de texto.
  private async generarEmbedding(contenido: string): Promise<number[]> {
    // Obtiene la URL para el servicio de embedding desde las variables de entorno.
    const embeddingUrl = process.env.EMBEDDING;

    // Lanza una excepción si la variable de entorno no está definida.
    if (!embeddingUrl) {
      throw new InternalServerErrorException(
        'La variable de entorno EMBEDDING no está definida. ' +
        'Agrega la variable en tu archivo .env',
      );
    }

    try {
      // Realiza una petición HTTP POST al servicio de embedding con el contenido proporcionado.
      const response = await fetch(embeddingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text', // Modelo usado para generar el embedding.
          prompt: contenido, // Contenido de texto para el cual se generará el embedding.
        }),
      });

      // Verifica si la respuesta de la petición no es exitosa y lanza un error en ese caso.
      if (!response.ok) {
        throw new Error(`Error al generar embedding: ${response.statusText}`);
      }

      // Parsea la respuesta JSON y retorna el embedding como un arreglo de números.
      const data = (await response.json()) as { embedding: number[] };
      return data.embedding;
    } catch (error) {
      // Maneja errores durante la generación del embedding, lanzando una excepción
      throw new InternalServerErrorException(
        'Error al generar el embedding con Ollama',
      );
    }
  }

  // Método para crear un nuevo mensaje y generar su embedding.
  async create(createMensajeDto: CreateMensajeDto): Promise<any> {
    // Extrae los datos del DTO para crear el mensaje.
    const { emisor, contenido, idconversacion } = createMensajeDto;
    // Obtiene la fecha y hora actual en la zona horaria de Bogotá.
    const now = moment().tz('America/Bogota').toDate();

    // Valida que el emisor sea 'user' o 'agent', lanzando una excepción si no es válido.
    if (!['user', 'agent'].includes(emisor)) {
      throw new BadRequestException('El emisor debe ser "user" o "agent"');
    }

    // Clasifica si el contenido del mensaje solicita un formulario.
    const isform = await classifyFormFlag(contenido);


    // Genera el embedding del contenido del mensaje.
    const embedding = await this.generarEmbedding(contenido);  

    // Ajusta la fecha a la zona horaria de Bogotá y la formatea.
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

    // Crea un nuevo mensaje con el embedding serializado como JSON.
    const nuevoMensaje = this.mensajesRepository.create({
      emisor,
      contenido,
      embedding: JSON.stringify(embedding),
      fcreado: formatted,
      idconversacion: idconversacion,
      isform: isform,
    });

    // Guarda el mensaje en la base de datos.
    const guardado = await this.mensajesRepository.save(nuevoMensaje);

    // Retorna los datos del mensaje guardado con los campos deseados.
    return {
      idmensajes: guardado.idmensajes,
      emisor: guardado.emisor,
      contenido: guardado.contenido,
      idconversacion: Number(guardado.idconversacion),
      isform: guardado.isform,
      fcreado: guardado.fcreado
    };
  }
}
