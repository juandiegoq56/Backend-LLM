// Importación de módulos necesarios de NestJS y otras librerías.
import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Carga las variables de entorno desde un archivo .env.
dotenv.config();

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class MoodleService {
  // Propiedades privadas para almacenar la URL de Moodle y el token de acceso desde las variables de entorno.
  private readonly MOODLE_URL_UD = process.env.MOODLE_URL_UD!;
  private readonly TOKEN_UD = process.env.TOKEN_UD!;

  /**
   * Método para buscar un usuario en Moodle por email y, opcionalmente, por número de documento.
   * @param email - Correo electrónico del usuario a buscar.
   * @param numdocumento - Número de documento del usuario (opcional).
   * @returns Información del usuario encontrado.
   * @throws HttpException si no se encuentra el usuario o hay un error en la consulta.
   */
  async obtenerUserByFields(email: string): Promise<any> {
  try {
    // Validar que el email no esté vacío y tenga un formato básico
    if (!email || !email.includes('@') || !email.includes('.')) {
      throw new BadRequestException('El correo electrónico proporcionado no es válido.');
    }

    // Construye los parámetros para la solicitud a la API de Moodle.
    const params: Record<string, any> = {
      wstoken: this.TOKEN_UD, // Token de autenticación para la API de Moodle.
      wsfunction: 'core_user_get_users', // Función de la API para buscar usuarios.
      moodlewsrestformat: 'json', // Formato de respuesta esperado (JSON).
      'criteria[0][key]': 'email', // Criterio de búsqueda 1: campo email.
      'criteria[0][value]': email, // Valor del email a buscar.
    };

    // Si se proporciona un número de documento, añade un segundo criterio de búsqueda.
    // (Este comentario se mantiene como en el código original, aunque no hay lógica implementada)

    // Realiza una solicitud POST a la API de Moodle con los parámetros definidos.
    const res = await axios.post(this.MOODLE_URL_UD, null, { params });

    // Verifica si la respuesta contiene usuarios y retorna el primero encontrado.
    if (res.data && res.data.users && res.data.users.length > 0) {
      return res.data.users[0];
    } else {
      // Lanza una excepción si no se encuentra ningún usuario.
      throw new NotFoundException('Usuario no encontrado en Moodle.');
    }
  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Re-lanzar errores específicos para que sean manejados por el controlador
    }
    // Captura y lanza errores relacionados con la consulta a Moodle.
    throw new InternalServerErrorException(`Error consultando Moodle: ${error.message}`);
  }
}
}
