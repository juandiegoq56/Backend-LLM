// Importación de decoradores y módulos necesarios de NestJS.
import { Controller, Post, Body, Get, Param, Res, HttpStatus, Patch, Put } from '@nestjs/common';
import { Response } from 'express';

// Importación de servicios personalizados para manejar lógica de negocio.
import { UnidadesTematicasService } from '../services/tutor_nivelador.service';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { ConversacionService } from 'src/services/conversaciones.service';
import { TemasService } from 'src/services/obtener-temas.services';
import { MensajesService } from 'src/services/mensajes.service';
import { MoodleService } from 'src/services/user.service';

// Importación de entidades y DTOs (Data Transfer Objects) para estructurar datos.
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { CreateMensajeDto } from 'src/dto/create-mensaje.dto';
import { CreateConversacionDto } from 'src/dto/Create-Conversacion.Dto';

// Decorador que define esta clase como un controlador con la ruta base 'unidades-tematicas'.
@Controller('unidades-tematicas')
export class UnidadesTematicasController {
  // Constructor que inyecta los servicios necesarios para manejar las operaciones.
  constructor(
    private readonly unidadesService: UnidadesTematicasService,
    private readonly obtenerFacultadService: ObtenerFacultad,
    private readonly obtenerProyectoService: ProyectoService,
    private readonly obtenerasignaturaService: AsignaturaService,
    private readonly obtenertemaService: TemasService,
    private readonly obenerconversacionesService: ConversacionService,
    private readonly obtenermensajesService: MensajesService,
    private readonly moodleService: MoodleService
  ) {}

  // Endpoint GET para obtener todas las facultades.
  @Get('facultades')
  async obtenerFacultades() {
    return this.obtenerFacultadService.obtenerFacultades();
  }

  // Endpoint GET para obtener proyectos por ID de facultad.
  @Get('proyectos/:facultad')
  async obtenerProyectosPorFacultad(@Param('facultad') facultad: number): Promise<any> {
    return this.obtenerProyectoService.obtenerProyectosPorFacultad(facultad);
  }

  // Endpoint GET para obtener asignaturas por ID de proyecto y ID de servicio.
  @Get('asignaturas/:proyecto/service/:idservicio')
  async obtenerAsignaturaPorProyecto(
    @Param('proyecto') proyecto: number,
    @Param('idservicio') idservicio: number,
  ): Promise<any> {
    return this.obtenerasignaturaService.obtenerAsignaturaPorProyecto(proyecto, idservicio);
  }

  // Endpoint GET para obtener temas por ID de asignatura.
  @Get('temas/:asignatura')
  async obtenerTemasPorAsignatura(@Param('asignatura') asignatura: number): Promise<any> {
    return this.obtenertemaService.obtenerTemasPorAsignatura(asignatura);
  }

  // Endpoint GET para obtener subtemas por ID de asignatura y ID de tema padre.
  @Get('temas/:asignatura/tema/:idpadre')
  async obtenerTemasPorTema(
    @Param('asignatura') asignatura: bigint,
    @Param('idpadre') idpadre: bigint
  ): Promise<any> {
    return this.obtenertemaService.obtenerTemasPorTema(asignatura, idpadre);
  }

  // Endpoint GET para obtener todas las unidades temáticas.
  @Get()
  async obtenerUnidades() {
    return this.unidadesService.obtenerUnidades();
  }

  // Endpoint POST para buscar un usuario por email y, opcionalmente, número de documento.
  @Post('usuario')
  async obtenerUsuario(
    @Body('email') email: string,
    @Body('numdocumento') numdocumento?: string,
  ) {
    const user = await this.moodleService.obtenerUserByFields(email, numdocumento);
    return { user };
  }

  // Endpoint POST para generar una respuesta usando un modelo de lenguaje (LLM).
  @Post('chat')
  async generarRespuestaLLM(
    @Body() data: {
      facultad: string;
      proyectoCurricular: string;
      materia: string;
      tema: string;
      subtema: string;
      pregunta: string;
      idconversacion: number;
    }
  ): Promise<{ respuesta: string }> {
    const respuesta = await this.unidadesService.generarRespuestaLLM(data);
    return { respuesta };
  }

  // Endpoint GET para obtener todas las conversaciones.
  @Get('conversaciones')
  async getAllmensaje(): Promise<Conversacion[]> {
    return this.obenerconversacionesService.findAll();
  }

  // Endpoint GET para obtener conversaciones por ID de usuario y ID de servicio.
  @Get('conversaciones/:id/service/:idservice')
  async getOne(
    @Param('id') id: string,
    @Param('idservice') idservice: bigint,
  ): Promise<any[]> {
    return this.obenerconversacionesService.findByUsuario(id, idservice);
  }

  // Endpoint GET para obtener todos los mensajes.
  @Get('mensajes')
  async getAllMensajes() {
    return this.obtenermensajesService.findAllmensaje();
  }

  // Endpoint GET para obtener un mensaje específico por ID.
  @Get('mensajes/:id')
  async getOneMensaje(@Param('id') id: number) {
    return this.obtenermensajesService.findOnemensaje(id);
  }

  // Endpoint POST para crear un nuevo mensaje.
  @Post('mensajes')
  async create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.obtenermensajesService.create(createMensajeDto);
  }

  // Endpoint POST para crear una nueva conversación.
  @Post('conversaciones')
  async createConversacion(
    @Body() createConversacionDto: CreateConversacionDto,
    @Res() res: Response,
  ) {
    try {
      // Crea la conversación usando los datos proporcionados.
      const conversacion = await this.obenerconversacionesService.create(
        createConversacionDto.titulo,
        createConversacionDto.idusuario,
        createConversacionDto.idtemas,
        createConversacionDto.idservicio
      );

      // Responde con un estado 201 (CREATED) y los detalles de la conversación creada.
      res.status(HttpStatus.CREATED).json({
        message: 'Conversación creada',
        id: conversacion.idconversacion,
        titulo: conversacion.titulo,
        fcreacion: conversacion.fcreacion,
        idusuario: conversacion.idusuario,
        idtemas: conversacion.idtemas,
      });
    } catch (error) {
      // Responde con un error 500 si ocurre un problema al crear la conversación.
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al crear conversación',
        error: error.message,
      });
    }
  }

  // Endpoint PUT para actualizar una conversación por ID.
  @Put('conversaciones/:id')
  async updateConversacion(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      // Actualiza la conversación usando el servicio correspondiente.
      await this.obenerconversacionesService.update(id);
      // Responde con un estado 200 (OK) si la actualización es exitosa.
      res.status(HttpStatus.OK).json({ message: 'Conversación actualizada' });
    } catch (error) {
      // Responde con un error 500 si ocurre un problema al actualizar.
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al actualizar conversación',
        error: error.message,
      });
    }
  }
}
