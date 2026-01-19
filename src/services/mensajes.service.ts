// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LlmService } from './llm.service'; // Importamos el nuevo servicio LlmService
// Importación de la entidad Mensajes y el DTO para crear mensajes.
import { Mensajes } from '../entities/Mensajes/mensajes.entity';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
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
    @InjectRepository(Conversacion)
    private readonly conversacionRepository : Repository<Conversacion>,
    private readonly llmService: LlmService, // Inyectamos el servicio para generar respuestas con LLM.

  ) {}

  // Método para obtener todos los mensajes con sus relaciones.
  async findAllmensaje(): Promise<any[]> {
  try {
    // Busca todos los mensajes, incluyendo la relación con la conversación.
    const mensajes = await this.mensajesRepository.find({
      relations: ['conversacion'],
    });

    // Validar si se encontraron mensajes
    if (!mensajes || mensajes.length === 0) {
      throw new NotFoundException('No se encontraron mensajes registrados en el sistema.');
    }

    // Mapea los mensajes para retornar solo los campos deseados.
    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof NotFoundException) {
      throw error; // Re-lanzar error específico para que sea manejado por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener los mensajes.');
  }
}

  // Método para buscar mensajes por ID de conversación.
 async findOnemensaje(id: number): Promise<any> {
  try {
    // Validar si el ID es válido
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestException('El ID proporcionado no es válido.');
    }

    // Busca un mensaje específico por su ID, incluyendo la relación con la conversación.
    const mensajes = await this.mensajesRepository.find({
      where: { conversacion: { idconversacion: id } },
      relations: ['conversacion'],
      order: { fcreado: 'ASC' },
    });

    // Lanza una excepción si no se encuentra el mensaje.
    if (!mensajes || mensajes.length === 0) {
      throw new NotFoundException(`No existen mensajes para la conversación`);
    }

    // Retorna solo los campos deseados.
    return mensajes.map((msg) => ({
      idmensaje: msg.idmensajes,
      emisor: msg.emisor,
      contenido: msg.contenido,
      fcreado: msg.fcreado,
      idconversacion: msg.idconversacion,
    }));
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener el mensaje.');
  }
}

  // Método privado para generar un embedding a partir de un contenido de texto.
 

  // Método para crear un nuevo mensaje y generar su embedding.
  async create(createMensajeDto: CreateMensajeDto): Promise<any> {
  try {
    // Extrae los datos del DTO para crear el mensaje.
    const { emisor, contenido, idconversacion } = createMensajeDto;

    // Valida que los campos obligatorios no estén vacíos
    if (!emisor || !contenido || idconversacion === undefined || idconversacion === null) {
      throw new BadRequestException('Los campos emisor, contenido e idconversacion son obligatorios.');
    }

    // Valida que el emisor sea 'user' o 'agent'
    if (!['user', 'agent'].includes(emisor)) {
      throw new BadRequestException('El emisor debe ser "user" o "agent".');
    }

    // Valida que el idconversacion sea un número válido
    if (isNaN(idconversacion) || idconversacion <= 0) {
      throw new BadRequestException('El ID de la conversación debe ser un número válido mayor a 0.');
    }

    // Verifica si la conversación existe
    const conversacion = await this.conversacionRepository.findOne({
      where: { idconversacion }
    });
    if (!conversacion) {
      throw new NotFoundException(`No existe una conversación con el ID ${idconversacion}.`);
    }

    // Obtiene la fecha y hora actual en la zona horaria de Bogotá.
    const now = moment().tz('America/Bogota').toDate();

    // Clasifica si el contenido del mensaje solicita un formulario.
    const isform = await classifyFormFlag(contenido);

    // Genera el embedding del contenido del mensaje.
    const embedding = await this.llmService.generarEmbedding(contenido);  

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
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al crear el mensaje.');
  }
}
}
