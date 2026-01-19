// Importación de decoradores y módulos necesarios de NestJS.
import { Controller, Post, Body, Get, Param, Res, HttpStatus, Patch, Put } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags,ApiParam,ApiBody  } from '@nestjs/swagger';
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
@ApiTags('General') // Etiqueta para agrupar endpoints en Swagger

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
  @ApiOperation({ summary: 'Obtiene la lista de facultades disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Facultades obtenidas exitosamente.',
    isArray: true, // Indica que la respuesta es un array de objetos
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron facultades en la base de datos.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async obtenerFacultades() {
    return this.obtenerFacultadService.obtenerFacultades();
  }

  // Endpoint GET para obtener proyectos por ID de facultad.
  @Get('proyectos/:facultad')
  @ApiOperation({ summary: 'Obtiene la lista de proyectos asociados a una facultad específica' })
  @ApiParam({
    name: 'facultad',
    description: 'Identificador numérico de la facultad para filtrar los proyectos',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Proyectos obtenidos exitosamente para la facultad especificada.',
    isArray: true, // Indica que la respuesta es un array de objetos
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si el identificador de la facultad no es un número válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron proyectos para la facultad especificada o la facultad no existe.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async obtenerProyectosPorFacultad(@Param('facultad') facultad: number): Promise<any> {
    return this.obtenerProyectoService.obtenerProyectosPorFacultad(facultad);
  }

  // Endpoint GET para obtener asignaturas por ID de proyecto y ID de servicio.
  @Get('asignaturas/:proyecto/service/:idservicio')
  @ApiOperation({ summary: 'Obtiene las asignaturas asociadas a un proyecto y un servicio específicos' })
  @ApiParam({
    name: 'proyecto',
    description: 'Identificador numérico del proyecto para filtrar las asignaturas',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'idservicio',
    description: 'Identificador numérico del servicio para filtrar las asignaturas',
    type: Number,
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Asignaturas obtenidas exitosamente para el proyecto y servicio especificados.',
    isArray: true, // Indica que la respuesta es un array de objetos
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si los identificadores del proyecto o del servicio no son números válidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron asignaturas para el proyecto y servicio especificados, o el proyecto/servicio no existe.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async obtenerAsignaturaPorProyecto(
    @Param('proyecto') proyecto: number,
    @Param('idservicio') idservicio: number,
  ): Promise<any> {
    return this.obtenerasignaturaService.obtenerAsignaturaPorProyecto(proyecto, idservicio);
  }

  // Endpoint GET para obtener temas por ID de asignatura.
  @Get('temas/:asignatura')

  @ApiOperation({ summary: 'Obtiene los temas asociados a una asignatura específica' })

  @ApiParam({
  name: 'asignatura',
  description: 'Identificador numérico de la asignatura para filtrar los temas',
  type: Number,
  example: 1,
 })
  @ApiResponse({
  status: 200,
  description: 'Temas obtenidos exitosamente para la asignatura especificada.',
  isArray: true, // Indica que la respuesta es un array de objetos
  })
  @ApiResponse({
  status: 400,
  description: 'Solicitud inválida. Ocurre si el identificador de la asignatura no es un número válido.',
  })
  @ApiResponse({
  status: 404,
  description: 'No se encontraron temas para la asignatura especificada, o la asignatura no existe.',
  })
  @ApiResponse({
  status: 500,
  description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async obtenerTemasPorAsignatura(@Param('asignatura') asignatura: number): Promise<any> {
    return this.obtenertemaService.obtenerTemasPorAsignatura(asignatura);
  }

  // Endpoint GET para obtener subtemas por ID de asignatura y ID de tema padre.
  @Get('temas/:asignatura/tema/:idpadre')
  @ApiOperation({ summary: 'Obtiene los temas asociados a una asignatura y un tema padre específicos' })
  @ApiParam({
    name: 'asignatura',
    description: 'Identificador numérico de la asignatura para filtrar los temas',
    type: Number,
    example: 1,
  })
  @ApiParam({
    name: 'idpadre',
    description: 'Identificador numérico del tema padre para filtrar los temas',
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Temas obtenidos exitosamente para la asignatura y tema padre especificados.',
    isArray: true, // Indica que la respuesta es un array de objetos
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si los identificadores de la asignatura o del tema padre no son números válidos.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron temas para la asignatura y tema padre especificados, o la asignatura/tema padre no existe.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async obtenerTemasPorTema(
    @Param('asignatura') asignatura: bigint,
    @Param('idpadre') idpadre: bigint
  ): Promise<any> {
    return this.obtenertemaService.obtenerTemasPorTema(asignatura, idpadre);
  }

  // Endpoint POST para buscar un usuario por email y, opcionalmente, número de documento.
  @Post('usuario')
  @ApiOperation({ 
    summary: 'Obtiene los datos de un usuario por su correo electrónico Institucional',
    description: 'Este endpoint permite buscar un usuario en Moodle utilizando su dirección de correo electrónico institucional. Devuelve los datos básicos del usuario si se encuentra.'
  })
  @ApiBody({
    description: 'Correo electrónico institucional del usuario a buscar',
    examples: {
      email: {
        summary: 'Búsqueda por email institucional',
        value: {
          email: 'juan.perez@udistrital.edu.co',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente.',
    schema: {
      type: 'object',
      properties: {
        user: {
          description: 'Datos del usuario encontrado',
          $ref: '#/components/schemas/UsuarioResponseDto',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si el correo electrónico no es proporcionado o no tiene un formato válido.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró un usuario con el correo electrónico proporcionado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión con Moodle o errores no manejados en el código.',
  })
  async obtenerUsuario(
    @Body('email') email: string,
  ) {
    const user = await this.moodleService.obtenerUserByFields(email);
    return { user };
  }

  // Endpoint POST para generar una respuesta usando un modelo de lenguaje (LLM).
  @Post('chat')
  @ApiOperation({ 
    summary: 'Genera una respuesta basada en un modelo de lenguaje (LLM)',
    description: 'Este endpoint permite generar una respuesta a una pregunta específica del usuario, considerando el contexto académico proporcionado (facultad, proyecto curricular, materia, tema y subtema). También utiliza un identificador de conversación para mantener el contexto de la interacción.'
  })
  @ApiBody({
    description: 'Datos necesarios para generar la respuesta',
    schema: {
      type: 'object',
      properties: {
        facultad: {
          type: 'string',
          description: 'Nombre de la facultad a la que pertenece el usuario o consulta',
          example: 'Ingeniería'
        },
        proyectoCurricular: {
          type: 'string',
          description: 'Nombre del proyecto curricular o programa académico',
          example: 'Ingeniería de Sistemas'
        },
        materia: {
          type: 'string',
          description: 'Nombre de la materia o asignatura relacionada con la consulta',
          example: 'Cálculo Diferencial'
        },
        tema: {
          type: 'string',
          description: 'Tema principal de la consulta',
          example: 'Derivadas'
        },
        subtema: {
          type: 'string',
          description: 'Subtema específico de la consulta',
          example: 'Regla de la Cadena'
        },
        pregunta: {
          type: 'string',
          description: 'Pregunta específica del usuario para la cual se busca una respuesta',
          example: '¿Cómo se aplica la regla de la cadena en derivadas?'
        },
        idconversacion: {
          type: 'number',
          description: 'Identificador único de la conversación para mantener el contexto',
          example: 12345
        }
      },
      required: ['facultad', 'proyectoCurricular', 'materia', 'tema', 'subtema', 'pregunta', 'idconversacion']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta generada exitosamente por el modelo de lenguaje.',
    schema: {
      type: 'object',
      properties: {
        respuesta: {
          type: 'string',
          description: 'Respuesta generada por el modelo de lenguaje',
          example: 'La regla de la cadena se aplica cuando tienes una función compuesta. Si tienes una función f(g(x)), la derivada es f\'(g(x)) * g\'(x). Por ejemplo...'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si faltan datos requeridos como la pregunta, materia o tema, o si los datos proporcionados no son válidos.',
  })
  @ApiResponse({
    status: 429,
    description: 'Límite de solicitudes excedido. Ocurre si se ha superado el límite de uso del servicio de generación de respuestas en un período de tiempo determinado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión con el servicio de LLM o errores no manejados en el código.',
  })
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
  @ApiOperation({ 
    summary: 'Obtiene todas las conversaciones del usuario',
    description: 'Este endpoint devuelve una lista de todas las conversaciones asociadas al usuario, incluyendo información básica como el título, fecha de creación y el último mensaje.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de conversaciones obtenida exitosamente.',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Conversacion',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron conversaciones. Ocurre si el usuario no tiene conversaciones registradas.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async getAllmensaje(): Promise<Conversacion[]> {
    return this.obenerconversacionesService.findAll();
  }

  // Endpoint GET para obtener conversaciones por ID de usuario y ID de servicio.
  @Get('conversaciones/:id/service/:idservice')
  @ApiOperation({ 
    summary: 'Obtiene los mensajes de una conversación específica de un usuario y servicio',
    description: 'Este endpoint devuelve una lista de mensajes asociados a un usuario específico y un servicio identificado por sus respectivos IDs. Es útil para recuperar el historial de una conversación en particular.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del usuario cuya conversación se desea consultar',
    type: String,
    example: 'user123'
  })
  @ApiParam({
    name: 'idservice',
    description: 'Identificador único del servicio asociado a la conversación',
    type: Number,
    example: 456
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes de la conversación obtenida exitosamente.',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Mensaje',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si los parámetros de ruta (id o idservice) no son válidos o están vacíos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversación no encontrada. Ocurre si no existen mensajes asociados al usuario y servicio proporcionados.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async getOne(
    @Param('id') id: string,
    @Param('idservice') idservice: bigint,
  ): Promise<any[]> {
    return this.obenerconversacionesService.findByUsuario(id, idservice);
  }

  // Endpoint GET para obtener todos los mensajes.
  @Get('mensajes')
  @ApiOperation({ 
    summary: 'Obtiene todos los mensajes registrados',
    description: 'Este endpoint devuelve una lista de todos los mensajes registrados en el sistema, incluyendo información como el contenido, fecha de envío, usuario y servicio asociado.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes obtenida exitosamente.',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Mensaje',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron mensajes. Ocurre si no hay mensajes registrados en el sistema.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async getAllMensajes() {
    return this.obtenermensajesService.findAllmensaje();
  }

  // Endpoint GET para obtener un mensaje específico por ID.
  @Get('mensajes/:id')
  @ApiOperation({ 
    summary: 'Obtiene un mensaje específico por su ID',
    description: 'Este endpoint devuelve la información detallada de un mensaje específico identificado por su ID único.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del mensaje que se desea consultar',
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje obtenido exitosamente.',
    schema: {
      $ref: '#/components/schemas/Mensaje',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si el parámetro de ruta (id) no es válido o está vacío.',
  })
  @ApiResponse({
    status: 404,
    description: 'Mensaje no encontrado. Ocurre si no existe un mensaje con el ID proporcionado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async getOneMensaje(@Param('id') id: number) {
    return this.obtenermensajesService.findOnemensaje(id);
  }

  // Endpoint POST para crear un nuevo mensaje.
  @Post('mensajes')
  @ApiOperation({ 
    summary: 'Crea un nuevo mensaje',
    description: 'Este endpoint permite crear un nuevo mensaje asociado a una conversación específica, especificando el emisor y el contenido del mensaje.'
  })
  @ApiBody({
    description: 'Datos necesarios para crear un nuevo mensaje',
    schema: {
      type: 'object',
      properties: {
        emisor: {
          type: 'string',
          enum: ['user', 'agent'],
          description: 'Emisor del mensaje, debe ser "user" o "agent"',
          example: 'user'
        },
        contenido: {
          type: 'string',
          description: 'Contenido del mensaje',
          example: 'Hola, necesito ayuda con derivadas.'
        },
        idconversacion: {
          type: 'number',
          description: 'Identificador de la conversación asociada al mensaje',
          example: 100
        }
      },
      required: ['emisor', 'contenido', 'idconversacion']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Mensaje creado exitosamente.',
    schema: {
      $ref: '#/components/schemas/Mensaje',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si los datos proporcionados no cumplen con las validaciones (por ejemplo, emisor no válido, contenido vacío o id de conversación no numérico).',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversación no encontrada. Ocurre si el ID de la conversación proporcionado no existe en el sistema.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
  async create(@Body() createMensajeDto: CreateMensajeDto) {
    return this.obtenermensajesService.create(createMensajeDto);
  }

  // Endpoint POST para crear una nueva conversación.
  @Post('conversaciones')
  @ApiOperation({ 
    summary: 'Crea una nueva conversación',
    description: 'Este endpoint permite crear una nueva conversación con un título, usuario, temas y servicio asociados.'
  })
  @ApiBody({
    description: 'Datos necesarios para crear una nueva conversación',
    schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título de la conversación',
          example: 'Consulta sobre matemáticas'
        },
        idusuario: {
          type: 'string',
          description: 'Identificador del usuario que crea la conversación',
          example: 'user123'
        },
        idtemas: {
          type: 'array',
          items: {
            type: 'number'
          },
          description: 'Lista de identificadores de temas asociados a la conversación',
          example: 103
        },
        idservicio: {
          type: 'number',
          description: 'Identificador del servicio asociado a la conversación',
          example: 1
        }
      },
      required: ['titulo', 'idusuario', 'idtemas', 'idservicio']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Conversación creada exitosamente.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Conversación creada'
        },
        id: {
          type: 'number',
          example: 1
        },
        titulo: {
          type: 'string',
          example: 'Consulta sobre matemáticas'
        },
        fcreacion: {
          type: 'string',
          format: 'date-time',
          example: '2023-10-15T14:30:00Z'
        },
        idusuario: {
          type: 'string',
          example: 'user123'
        },
        idtemas: {
          type: 'array',
          items: {
            type: 'number'
          },
          example: [1, 2]
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida. Ocurre si los datos proporcionados no cumplen con las validaciones (por ejemplo, título vacío, ID de usuario vacío, temas no válidos o ID de servicio no numérico).',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.',
  })
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

  
}
