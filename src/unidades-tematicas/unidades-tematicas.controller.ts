import { Controller, Post, Body, Get } from '@nestjs/common';
import { UnidadesTematicasService } from './unidades-tematicas.service';

@Controller('unidades-tematicas')
export class UnidadesTematicasController {
  constructor(private readonly unidadesService: UnidadesTematicasService) {}

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
