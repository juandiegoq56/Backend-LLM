// Importación de módulos y decoradores necesarios de NestJS y TypeORM.
import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from '../entities/Conversacion/conversacion.entity';
import { Temas } from 'src/entities/Tema/temas.entity';
import * as moment from 'moment-timezone';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class ConversacionService {
  // Constructor que inyecta los repositorios de las entidades Conversacion y Temas para interactuar con la base de datos.
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Temas)
    private temaRepository: Repository<Temas>,
  ) {}

  // Método para obtener todas las conversaciones con información relacionada de tema y usuario.
  async findAll(): Promise<any[]> {
  try {
    // Busca todas las conversaciones, incluyendo relaciones con tema y usuario, ordenadas por fecha de último mensaje descendente.
    const conversaciones = await this.conversacionRepository.find({
      relations: ['tema', 'usuario'],
      order: {
        fultimo_mensaje: 'DESC', // Ordena de más reciente a más antiguo.
      },
    });

    // Validar si se encontraron conversaciones
    if (!conversaciones || conversaciones.length === 0) {
      throw new NotFoundException('No se encontraron conversaciones.');
    }

    // Mapea las conversaciones para retornar un objeto con los campos deseados.
    return conversaciones.map((conv) => ({
      idconversacion: conv.idconversacion,
      titulo: conv.titulo,
      fcreacion: conv.fcreacion,  
      fultimo_mensaje: conv.fultimo_mensaje,
      usuario: conv.idusuario, // Asumiendo que en la entidad Usuario hay un campo como "username".
      tema: conv.tema ? conv.tema.nombre : null, // Asumiendo que en la entidad Temas hay un campo "nombre".
    }));
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof NotFoundException) {
      throw error; // Re-lanzar error específico para que sea manejado por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener las conversaciones.');
  }}
  
  // Método para obtener conversaciones filtradas por usuario y servicio.
  async findByUsuario(id: string, idservice: bigint): Promise<any[]> {
  try {
    // Validar que los parámetros no estén vacíos o sean inválidos
    if (!id || id.trim() === '') {
      throw new BadRequestException('El identificador del usuario no puede estar vacío.');
    }
    if (!idservice || isNaN(Number(idservice)) || idservice.toString().includes('.')) {
      throw new BadRequestException('El identificador del servicio debe ser un número válido (bigint).');
    }

    // Busca conversaciones filtradas por ID de usuario y servicio, incluyendo relación con tema, ordenadas por fecha de último mensaje descendente.
    const conversaciones = await this.conversacionRepository.find({
      where: { idusuario: id, idservicio: idservice },
      relations: ['tema'], // Importante para traer la información del tema.
      order: {
        fultimo_mensaje: 'DESC', // Ordena de más reciente a más antiguo.
      },
    });

    // Validar si se encontraron conversaciones
    if (!conversaciones || conversaciones.length === 0) {
      throw new NotFoundException('No se encontraron conversaciones para el usuario y servicio proporcionados.');
    }

    return conversaciones;
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Manejo de errores inesperados (como problemas de base de datos)
    throw new InternalServerErrorException('Error interno del servidor al obtener las conversaciones.');
  }
}

  // Método para crear una nueva conversación.
  async create(
    titulo: string,
    usuarioCorreo: string,  // Recibe el correo del usuario.
    temaId: number,
    idservice: number
  ): Promise<Conversacion> {
    // Busca el tema por su ID para asociarlo a la conversación.
    const tema = await this.temaRepository.findOne({
      where: { idtemas: temaId },
    });

    // Lanza un error si el tema no se encuentra.
    if (!tema) {
      throw new Error('Tema no encontrado');
    }

    // Obtiene la fecha y hora actual en la zona horaria de Bogotá.
    const now = moment().tz('America/Bogota').toDate();

    // Crea una nueva instancia de Conversacion y asigna los valores.
    const conversacion = new Conversacion();
    conversacion.titulo = titulo;
    conversacion.fcreacion = now;
    conversacion.fultimo_mensaje = now;
    conversacion.idusuario = usuarioCorreo; // Asigna el correo del usuario como ID.
    conversacion.idtemas = BigInt(tema.idtemas);
    conversacion.tema = tema;
    conversacion.idservicio = BigInt(idservice);

    // Guarda la conversación en la base de datos y la retorna.
    return this.conversacionRepository.save(conversacion);
  }

  // Método para actualizar la fecha del último mensaje de una conversación.
  async update(id: string): Promise<void> {
    // Obtiene la fecha y hora actual.
    const now = new Date();

    // Ajusta la hora a la zona horaria de Bogotá (UTC-5).
    const bogotaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Bogota" })
    );

    // Formatea la fecha y hora en un string con el formato deseado (YYYY-MM-DD HH:MM:SS).
    const year = bogotaTime.getFullYear();
    const month = String(bogotaTime.getMonth() + 1).padStart(2, "0");
    const day = String(bogotaTime.getDate()).padStart(2, "0");
    const hours = String(bogotaTime.getHours()).padStart(2, "0");
    const minutes = String(bogotaTime.getMinutes()).padStart(2, "0");
    const seconds = String(bogotaTime.getSeconds()).padStart(2, "0");

    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Actualiza la fecha del último mensaje en la base de datos.
    await this.conversacionRepository.update(id, {
      fultimo_mensaje: formatted,
    });
  }
}
