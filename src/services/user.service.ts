import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class MoodleService {
  private readonly MOODLE_URL_UD =process.env.MOODLE_URL_UD!;

  private readonly TOKEN_UD = process.env.TOKEN_UD!;

  /**
   * Buscar usuario en Moodle por email y (opcional) número de documento
   */
  async obtenerUserByFields(email: string, numdocumento?: string): Promise<any> {

   
    try {
      const params: Record<string, any> = {
        wstoken: this.TOKEN_UD,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
        'criteria[0][key]': 'email',
        'criteria[0][value]': email,
      };

      // Si también quieres validar documento:
      if (numdocumento) {
        params['criteria[1][key]'] = 'idnumber';
        params['criteria[1][value]'] = numdocumento;
      }

      const res = await axios.post(this.MOODLE_URL_UD, null, { params });
      if (res.data && res.data.users && res.data.users.length > 0) {
        return res.data.users[0];
      } else {
        throw new HttpException(
          'Usuario no encontrado en Moodle',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error consultando Moodle: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
