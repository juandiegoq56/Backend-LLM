import { Controller, Post, Body, Get,Param,Res,HttpStatus,Patch, Put  } from '@nestjs/common';
import { UnidadesTematicasService } from '../services/unidades-tematicas.service';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { ConversacionService } from 'src/services/conversaciones.service';
import { TemasService } from 'src/services/obtener-temas.services';
import { Conversacion } from 'src/entities/Conversacion/conversacion.entity';
import { MensajesService } from 'src/services/mensajes.service';
import { CreateMensajeDto } from 'src/dto/create-mensaje.dto';
import { CreateConversacionDto } from 'src/dto/Create-Conversacion.Dto';
import { MoodleService } from 'src/services/user.service';
import { Response } from 'express';
@Controller('unidades-tematicas')
export class UnidadesTematicasController {
  constructor(
    private readonly unidadesService: UnidadesTematicasService,
    private readonly obtenerFacultadService: ObtenerFacultad,
    private readonly obtenerProyectoService: ProyectoService,
    private readonly obtenerasignaturaService: AsignaturaService,
    private readonly obtenertemaService : TemasService,
    private readonly obenerconversacionesService : ConversacionService,
    private readonly obtenermensajesService : MensajesService,
    private readonly moodleService : MoodleService
  ) {}

  @Get('facultades')
  async obtenerFacultades() {
    return this.obtenerFacultadService.obtenerFacultades();
  }
  @Get('proyectos/:facultad')
  async obtenerProyectosPorFacultad(@Param('facultad') facultad: number): Promise<any> {
    return this.obtenerProyectoService.obtenerProyectosPorFacultad(facultad);
  }
  @Get('asignaturas/:proyecto')
  async obtenerAsignauraPorProyecto(@Param('proyecto') proyecto: number): Promise<any> {
    return this.obtenerasignaturaService.obtenerAsignauraPorProyecto(proyecto);
  }

  @Get('temas/:asignatura')
  async obtenerTemasPorAsignatura(@Param('asignatura') asignatura: number): Promise<any> {
    return this.obtenertemaService.obtenerTemasPorAsignatura(asignatura);
  }
  @Get('temas/:asignatura/tema/:idpadre')
  async obtenerTemasPorTema(
  @Param('asignatura') asignatura: bigint,
  @Param('idpadre') idpadre: bigint
  ): Promise<any> {
  return this.obtenertemaService.obtenerTemasPorTema(asignatura, idpadre);
  }

  @Get()
  async obtenerUnidades() {
    return this.unidadesService.obtenerUnidades();
  }
@Post("usuario")

  async obtenerUsuario(
    @Body('email') email: string,
    @Body('numdocumento') numdocumento?: string,
  ) {
    const user = await this.moodleService.obtenerUserByFields(
      email,
      numdocumento,
    );
    return { user };
  }

 
  

   @Post('chat')
async generarRespuestaLLM(
  @Body() data: {
    facultad: string;
    proyectoCurricular: string;
    materia: string;
    tema: string;
    subtema: string;
    pregunta: string;
    idconversacion:number
  }
): Promise<{ respuesta: string }> {
  const respuesta = await this.unidadesService.generarRespuestaLLM(data);
  return { respuesta };
}


  @Get('conversaciones')
  async getAllmensaje(): Promise<Conversacion[]> {
    return this.obenerconversacionesService.findAll();
  }

  // GET /conversaciones/:id
  @Get('conversaciones/:id')
  async getOne(@Param('id') id: number): Promise<Conversacion  | null > {
    return this.obenerconversacionesService.findOne(id);
  }
 @Get('mensajes')
  async getAllMensajes() {
    return this.obtenermensajesService.findAllmensaje(); // 👈 aquí invocas tu servicio
  }
 
  @Get('mensajes/:id')
async getOneMensaje(@Param('id') id: number) {
  return this.obtenermensajesService.findOnemensaje(id);
}

@Post('mensajes')
  async create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.obtenermensajesService.create(createMensajeDto);
  }


  @Post('conversaciones')
  async createConversacion(
    @Body() createConversacionDto: CreateConversacionDto,
    @Res() res: Response,
  ) {
    try {
      const conversacion = await this.obenerconversacionesService.create(
        createConversacionDto.titulo,
        createConversacionDto.idusuario,
        createConversacionDto.idtemas,
      );

      res.status(HttpStatus.CREATED).json({
        message: 'Conversación creada',
        id: conversacion.idconversacion,
        titulo: conversacion.titulo,
        fcreacion: conversacion.fcreacion,
        idusuario: conversacion.idusuario,
        idtemas: conversacion.idtemas,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al crear conversación',
        error: error.message,
      });
    }
  }

  @Put('conversaciones/:id')
  async updateConversacion(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      await this.obenerconversacionesService.update(id);
      res.status(HttpStatus.OK).json({ message: 'Conversación actualizada' });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al actualizar conversación',
        error: error.message,
      });
    }
  }
  
   
/*

  @Get('facultades-proyectos')
  async obtenerFacultadesProyectos() {
    return this.unidadesService.obtenerUnidadesPorFacultad();
  }
 /*
  // 🚀 NUEVO: Endpoint para generar plan de estudio con el LLM
  @Post('plan-estudio')
  async generarPlanDeEstudio(@Body() body: any) {
    const { facultad, proyecto, asignatura } = body;
    return this.unidadesService.generarPlanDeEstudio(facultad, proyecto, asignatura);
  }

  @Post('chat')
  async iniciarChatConLLM(@Body() body:any){
  const { facultad, proyecto, asignatura,preguntasPrevias,preguntaActual } = body;
  return this.unidadesService.iniciarChatConLLM(facultad, proyecto, asignatura,preguntasPrevias,preguntaActual)
  }*/
}
