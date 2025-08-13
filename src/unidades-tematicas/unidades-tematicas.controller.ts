import { Controller, Post, Body, Get,Param } from '@nestjs/common';
import { UnidadesTematicasService } from '../services/unidades-tematicas.service';
import { ObtenerFacultad } from 'src/services/Obtener-facultad.service';
import { ProyectoService } from 'src/services/obtener-proyecto.service';
import { AsignaturaService } from 'src/services/obtener-asignatura.service';
import { TemasService } from 'src/services/obtener-temas.services';
@Controller('unidades-tematicas')
export class UnidadesTematicasController {
  constructor(
    private readonly unidadesService: UnidadesTematicasService,
    private readonly obtenerFacultadService: ObtenerFacultad,
    private readonly obtenerProyectoService: ProyectoService,
    private readonly obtenerasignaturaService: AsignaturaService,
    private readonly obtenertemaService : TemasService
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

  @Post('buscar')
  async obtenerUnidadesPorFiltros(@Body() body: any) {
    const { facultad, proyecto, asignatura } = body;
    return this.unidadesService.obtenerTemasPorFiltros(facultad, proyecto, asignatura);
  }

  @Get('facultades-proyectos')
  async obtenerFacultadesProyectos() {
    return this.unidadesService.obtenerUnidadesPorFacultad();
  }
 
  @Post('plan-estudio')
  async generarPlanDeEstudio(@Body() body: any) {
    const { facultad, proyecto, asignatura } = body;
    return this.unidadesService.generarPlanDeEstudio(facultad, proyecto, asignatura);
  }
  

   @Post('chat')
  async iniciarChatConLLM(@Body() body:any){
  const { facultad, proyecto, asignatura,preguntasPrevias,preguntaActual } = body;
  return this.unidadesService.iniciarChatConLLM(facultad, proyecto, asignatura,preguntasPrevias,preguntaActual)
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
