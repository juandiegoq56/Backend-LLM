<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# 📘 Backend – Tutor Nivelador Académico con LLM

## 1. Descripción General

Este backend implementa un **Tutor Nivelador Académico** basado en un **Modelo de Lenguaje (LLM)**, cuyo objetivo es apoyar a estudiantes universitarios en procesos de nivelación académica en asignaturas básicas de primeros semestres.

El sistema utiliza información académica estructurada (facultades, proyectos curriculares, asignaturas y temas) para generar **respuestas guiadas, acotadas y contextualizadas**, evitando respuestas genéricas del modelo.

---

## 2. Tecnologías Utilizadas

- Node.js
- NestJS
- TypeScript
- TypeORM
- Base de datos relacional (MySQL / PostgreSQL)
- LLM (servicio encapsulado)

---

## 3. Arquitectura General

El backend sigue una arquitectura **modular y desacoplada**, basada en el patrón:


Principales capas:
- **Controllers:** Exponen endpoints
- **Services:** Contienen la lógica de negocio
- **Entities:** Representan el modelo de datos
- **DTOs:** Validan y estructuran la entrada de datos
- **LLM Service:** Abstrae la comunicación con el modelo

---

## 4. Estructura del Proyecto

```bash
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
│
├── database/
│   └── database.module.ts
│
├── dto/
│   ├── Create-Conversation.Dto.ts
│   └── create-mensaje.dto.ts
│
├── entities/
│   ├── Asignatura/
│   ├── Conversacion/
│   ├── Facultad/
│   ├── Mensajes/
│   ├── Proyecto/
│   ├── Tema/
│   └── Usuario/
│
├── services/
│   ├── clasificador.service.ts
│   ├── conversaciones.service.ts
│   ├── llm.service.ts
│   ├── mensajes.service.ts
│   ├── obtener-asignatura.service.ts
│   ├── obtener-facultad.service.ts
│   ├── obtener-proyecto.service.ts
│   ├── obtener-temas.services.ts
│   ├── tutor_nivelador.service.ts
│   └── user.service.ts
│
└── tutor_nivelador/
    ├── tutor_nivelador.controller.ts
    ├── tutor_nivelador.module.ts
    └── tutor_nivelador.service.ts 
```   
---
## 5. Documentación Detallada de Servicios

Esta sección describe **todos los servicios del backend**, su responsabilidad específica, su rol dentro del flujo del sistema y sus dependencias.

---

## 5.1 TutorNiveladorService

**Archivo:** `services/tutor_nivelador.service.ts`

### Descripción
Servicio **orquestador principal** del sistema de tutoría. Centraliza la lógica del negocio y coordina todos los demás servicios.

### Responsabilidades
- Procesar mensajes del usuario
- Determinar el tipo de mensaje
- Obtener contexto académico
- Construir el prompt para el LLM
- Invocar el modelo de lenguaje
- Persistir conversaciones y mensajes

### Dependencias
- ClasificadorService
- ConversacionesService
- MensajesService
- LLMService
- Servicios académicos
- UserService

---

## 5.2 LLMService

**Archivo:** `services/llm.service.ts`

### Descripción
Encapsula la integración con el **Modelo de Lenguaje (LLM)**.

### Responsabilidades
- Enviar prompts al LLM
- Recibir y procesar respuestas
- Manejar errores del proveedor
- Abstraer el proveedor del modelo

### Importante
El sistema **nunca interactúa directamente** con el LLM fuera de este servicio.

---

## 5.3 ClasificadorService

**Archivo:** `services/clasificador.service.ts`

### Descripción
Servicio encargado de **clasificar los mensajes del usuario**.

### Responsabilidades
- Determinar si un mensaje corresponde a:
  - Un formulario
  - Una conversación normal
- Retornar banderas como `isForm`

### Uso
Permite cambiar el flujo del sistema dependiendo del tipo de mensaje recibido.

---

## 5.4 ConversacionesService

**Archivo:** `services/conversaciones.service.ts`

### Descripción
Gestiona el **ciclo de vida de las conversaciones**.

### Responsabilidades
- Crear nuevas conversaciones
- Obtener conversaciones existentes
- Asociar mensajes a una conversación
- Recuperar la última conversación activa

### Entidades Relacionadas
- Conversacion
- Usuario

---

## 5.5 MensajesService

**Archivo:** `services/mensajes.service.ts`

### Descripción
Gestiona la persistencia y consulta de mensajes.

### Responsabilidades
- Guardar mensajes del usuario
- Guardar respuestas del tutor
- Consultar historial de mensajes
- Marcar mensajes con banderas (`isForm`, `emisor`)

### Entidades Relacionadas
- Mensajes
- Conversacion

---

## 5.6 ObtenerFacultadService

**Archivo:** `services/obtener-facultad.service.ts`

### Descripción
Servicio académico encargado de obtener las **facultades** registradas.

### Responsabilidades
- Consultar facultades desde la base de datos
- Retornar catálogos académicos base

### Uso
Primer nivel de selección del contexto académico.

---

## 5.7 ObtenerProyectoService

**Archivo:** `services/obtener-proyecto.service.ts`

### Descripción
Obtiene los **proyectos curriculares** asociados a una facultad.

### Responsabilidades
- Filtrar proyectos por facultad
- Retornar proyectos disponibles

### Dependencia
- Facultad seleccionada previamente

---

## 5.8 ObtenerAsignaturaService

**Archivo:** `services/obtener-asignatura.service.ts`

### Descripción
Servicio encargado de obtener las **asignaturas** de un proyecto curricular.

### Responsabilidades
- Listar asignaturas por proyecto
- Validar relaciones académicas

---

## 5.9 ObtenerTemasService

**Archivo:** `services/obtener-temas.services.ts`

### Descripción
Servicio crítico para el LLM, encargado de obtener los **temas académicos**.

### Responsabilidades
- Consultar temas por asignatura
- Retornar unidades y contenidos temáticos

### Rol en el sistema
Define el **contexto exacto** que se envía al modelo de lenguaje, limitando sus respuestas.

---

## 5.10 UserService

**Archivo:** `services/user.service.ts`

### Descripción
Gestiona la información de los usuarios del sistema.

### Responsabilidades
- Crear usuarios
- Consultar usuarios
- Asociar usuarios a conversaciones

### Entidades Relacionadas
- Usuario
- Conversacion

---

## 6. Relación General entre Servicios

```text
TutorNiveladorService
 ├── ClasificadorService
 ├── ConversacionesService
 ├── MensajesService
 ├── LLMService
 ├── ObtenerFacultadService
 ├── ObtenerProyectoService
 ├── ObtenerAsignaturaService
 ├── ObtenerTemasService
 └── UserService

```
# Documentación de la API - Sistema Académico

Esta documentación describe los endpoints de la API para la gestión de facultades, proyectos, asignaturas, temas, usuarios, conversaciones y mensajes en un sistema académico. La especificación sigue el estándar OpenAPI 3.0.0 y está diseñada para integrarse con herramientas como Swagger UI.

## Especificación OpenAPI

```yaml
openapi: 3.0.0
info:
  title: API del Sistema Académico
  description: API para la gestión de información académica, incluyendo facultades, proyectos, asignaturas, temas, usuarios, conversaciones y mensajes.
  version: 1.0.0

paths:
  /facultades:
    get:
      summary: Obtiene la lista de facultades disponibles
      responses:
        '200':
          description: Facultades obtenidas exitosamente.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '404':
          description: No se encontraron facultades en la base de datos.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /proyectos/{facultad}:
    get:
      summary: Obtiene la lista de proyectos asociados a una facultad específica
      parameters:
        - name: facultad
          in: path
          required: true
          description: Identificador numérico de la facultad para filtrar los proyectos
          schema:
            type: number
            example: 1
      responses:
        '200':
          description: Proyectos obtenidos exitosamente para la facultad especificada.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '400':
          description: Solicitud inválida. Ocurre si el identificador de la facultad no es un número válido.
        '404':
          description: No se encontraron proyectos para la facultad especificada o la facultad no existe.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /asignaturas/{proyecto}/service/{idservicio}:
    get:
      summary: Obtiene las asignaturas asociadas a un proyecto y un servicio específicos
      parameters:
        - name: proyecto
          in: path
          required: true
          description: Identificador numérico del proyecto para filtrar las asignaturas
          schema:
            type: number
            example: 1
        - name: idservicio
          in: path
          required: true
          description: Identificador numérico del servicio para filtrar las asignaturas
          schema:
            type: number
            example: 2
      responses:
        '200':
          description: Asignaturas obtenidas exitosamente para el proyecto y servicio especificados.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '400':
          description: Solicitud inválida. Ocurre si los identificadores del proyecto o del servicio no son números válidos.
        '404':
          description: No se encontraron asignaturas para el proyecto y servicio especificados, o el proyecto/servicio no existe.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /temas/{asignatura}:
    get:
      summary: Obtiene los temas asociados a una asignatura específica
      parameters:
        - name: asignatura
          in: path
          required: true
          description: Identificador numérico de la asignatura para filtrar los temas
          schema:
            type: number
            example: 1
      responses:
        '200':
          description: Temas obtenidos exitosamente para la asignatura especificada.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '400':
          description: Solicitud inválida. Ocurre si el identificador de la asignatura no es un número válido.
        '404':
          description: No se encontraron temas para la asignatura especificada, o la asignatura no existe.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /temas/{asignatura}/tema/{idpadre}:
    get:
      summary: Obtiene los temas asociados a una asignatura y un tema padre específicos
      parameters:
        - name: asignatura
          in: path
          required: true
          description: Identificador numérico de la asignatura para filtrar los temas
          schema:
            type: number
            example: 1
        - name: idpadre
          in: path
          required: true
          description: Identificador numérico del tema padre para filtrar los temas
          schema:
            type: number
            example: 0
      responses:
        '200':
          description: Temas obtenidos exitosamente para la asignatura y tema padre especificados.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
        '400':
          description: Solicitud inválida. Ocurre si los identificadores de la asignatura o del tema padre no son números válidos.
        '404':
          description: No se encontraron temas para la asignatura y tema padre especificados, o la asignatura/tema padre no existe.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /usuario:
    post:
      summary: Obtiene los datos de un usuario por su correo electrónico Institucional
      description: Este endpoint permite buscar un usuario en Moodle utilizando su dirección de correo electrónico institucional. Devuelve los datos básicos del usuario si se encuentra.
      requestBody:
        description: Correo electrónico institucional del usuario a buscar
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  example: juan.perez@udistrital.edu.co
              required:
                - email
      responses:
        '200':
          description: Usuario obtenido exitosamente.
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/UsuarioResponseDto'
        '400':
          description: Solicitud inválida. Ocurre si el correo electrónico no es proporcionado o no tiene un formato válido.
        '404':
          description: No se encontró un usuario con el correo electrónico proporcionado.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión con Moodle o errores no manejados en el código.

  /chat:
    post:
      summary: Genera una respuesta basada en un modelo de lenguaje (LLM)
      description: Este endpoint permite generar una respuesta a una pregunta específica del usuario, considerando el contexto académico proporcionado (facultad, proyecto curricular, materia, tema y subtema). También utiliza un identificador de conversación para mantener el contexto de la interacción.
      requestBody:
        description: Datos necesarios para generar la respuesta
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                facultad:
                  type: string
                  description: Nombre de la facultad a la que pertenece el usuario o consulta
                  example: Ingeniería
                proyectoCurricular:
                  type: string
                  description: Nombre del proyecto curricular o programa académico
                  example: Ingeniería de Sistemas
                materia:
                  type: string
                  description: Nombre de la materia o asignatura relacionada con la consulta
                  example: Cálculo Diferencial
                tema:
                  type: string
                  description: Tema principal de la consulta
                  example: Derivadas
                subtema:
                  type: string
                  description: Subtema específico de la consulta
                  example: Regla de la Cadena
                pregunta:
                  type: string
                  description: Pregunta específica del usuario para la cual se busca una respuesta
                  example: ¿Cómo se aplica la regla de la cadena en derivadas?
                idconversacion:
                  type: number
                  description: Identificador único de la conversación para mantener el contexto
                  example: 12345
              required:
                - facultad
                - proyectoCurricular
                - materia
                - tema
                - subtema
                - pregunta
                - idconversacion
      responses:
        '200':
          description: Respuesta generada exitosamente por el modelo de lenguaje.
          content:
            application/json:
              schema:
                type: object
                properties:
                  respuesta:
                    type: string
                    description: Respuesta generada por el modelo de lenguaje
                    example: La regla de la cadena se aplica cuando tienes una función compuesta. Si tienes una función f(g(x)), la derivada es f'(g(x)) * g'(x). Por ejemplo...
        '400':
          description: Solicitud inválida. Ocurre si faltan datos requeridos como la pregunta, materia o tema, o si los datos proporcionados no son válidos.
        '429':
          description: Límite de solicitudes excedido. Ocurre si se ha superado el límite de uso del servicio de generación de respuestas en un período de tiempo determinado.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión con el servicio de LLM o errores no manejados en el código.

  /conversaciones:
    get:
      summary: Obtiene todas las conversaciones del usuario
      description: Este endpoint devuelve una lista de todas las conversaciones asociadas al usuario, incluyendo información básica como el título, fecha de creación y el último mensaje.
      responses:
        '200':
          description: Lista de conversaciones obtenida exitosamente.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Conversacion'
        '404':
          description: No se encontraron conversaciones. Ocurre si el usuario no tiene conversaciones registradas.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.
    post:
      summary: Crea una nueva conversación
      description: Este endpoint permite crear una nueva conversación con un título, usuario, temas y servicio asociados.
      requestBody:
        description: Datos necesarios para crear una nueva conversación
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                titulo:
                  type: string
                  description: Título de la conversación
                  example: Consulta sobre matemáticas
                idusuario:
                  type: string
                  description: Identificador del usuario que crea la conversación
                  example: user123
                idtemas:
                  type: array
                  items:
                    type: number
                  description: Lista de identificadores de temas asociados a la conversación
                  example: 103
                idservicio:
                  type: number
                  description: Identificador del servicio asociado a la conversación
                  example: 1
              required:
                - titulo
                - idusuario
                - idtemas
                - idservicio
      responses:
        '201':
          description: Conversación creada exitosamente.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: Conversación creada
                  id:
                    type: number
                    example: 1
                  titulo:
                    type: string
                    example: Consulta sobre matemáticas
                  fcreacion:
                    type: string
                    format: date-time
                    example: '2023-10-15T14:30:00Z'
                  idusuario:
                    type: string
                    example: user123
                  idtemas:
                    type: array
                    items:
                      type: number
                    example: [1, 2]
        '400':
          description: Solicitud inválida. Ocurre si los datos proporcionados no cumplen con las validaciones (por ejemplo, título vacío, ID de usuario vacío, temas no válidos o ID de servicio no numérico).
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /conversaciones/{id}/service/{idservice}:
    get:
      summary: Obtiene los mensajes de una conversación específica de un usuario y servicio
      description: Este endpoint devuelve una lista de mensajes asociados a un usuario específico y un servicio identificado por sus respectivos IDs. Es útil para recuperar el historial de una conversación en particular.
      parameters:
        - name: id
          in: path
          required: true
          description: Identificador único del usuario cuya conversación se desea consultar
          schema:
            type: string
            example: user123
        - name: idservice
          in: path
          required: true
          description: Identificador único del servicio asociado a la conversación
          schema:
            type: number
            example: 456
      responses:
        '200':
          description: Lista de mensajes de la conversación obtenida exitosamente.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Mensaje'
        '400':
          description: Solicitud inválida. Ocurre si los parámetros de ruta (id o idservice) no son válidos o están vacíos.
        '404':
          description: Conversación no encontrada. Ocurre si no existen mensajes asociados al usuario y servicio proporcionados.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /mensajes:
    get:
      summary: Obtiene todos los mensajes registrados
      description: Este endpoint devuelve una lista de todos los mensajes registrados en el sistema, incluyendo información como el contenido, fecha de envío, usuario y servicio asociado.
      responses:
        '200':
          description: Lista de mensajes obtenida exitosamente.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Mensaje'
        '404':
          description: No se encontraron mensajes. Ocurre si no hay mensajes registrados en el sistema.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.
    post:
      summary: Crea un nuevo mensaje
      description: Este endpoint permite crear un nuevo mensaje asociado a una conversación específica, especificando el emisor y el contenido del mensaje.
      requestBody:
        description: Datos necesarios para crear un nuevo mensaje
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                emisor:
                  type: string
                  enum: [user, agent]
                  description: Emisor del mensaje, debe ser "user" o "agent"
                  example: user
                contenido:
                  type: string
                  description: Contenido del mensaje
                  example: Hola, necesito ayuda con derivadas.
                idconversacion:
                  type: number
                  description: Identificador de la conversación asociada al mensaje
                  example: 100
              required:
                - emisor
                - contenido
                - idconversacion
      responses:
        '201':
          description: Mensaje creado exitosamente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Mensaje'
        '400':
          description: Solicitud inválida. Ocurre si los datos proporcionados no cumplen con las validaciones (por ejemplo, emisor no válido, contenido vacío o id de conversación no numérico).
        '404':
          description: Conversación no encontrada. Ocurre si el ID de la conversación proporcionado no existe en el sistema.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

  /mensajes/{id}:
    get:
      summary: Obtiene un mensaje específico por su ID
      description: Este endpoint devuelve la información detallada de un mensaje específico identificado por su ID único.
      parameters:
        - name: id
          in: path
          required: true
          description: Identificador único del mensaje que se desea consultar
          schema:
            type: number
            example: 1
      responses:
        '200':
          description: Mensaje obtenido exitosamente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Mensaje'
        '400':
          description: Solicitud inválida. Ocurre si el parámetro de ruta (id) no es válido o está vacío.
        '404':
          description: Mensaje no encontrado. Ocurre si no existe un mensaje con el ID proporcionado.
        '500':
          description: Error interno del servidor. Ocurre cuando hay un problema inesperado en el servidor, como fallos en la conexión a la base de datos o errores no manejados en el código.

components:
  schemas:
    UsuarioResponseDto:
      type: object
      description: Datos del usuario encontrado en Moodle
      properties:
        id:
          type: number
          description: Identificador único del usuario
        username:
          type: string
          description: Nombre de usuario en Moodle
        email:
          type: string
          description: Correo electrónico institucional del usuario
        fullname:
          type: string
          description: Nombre completo del usuario

    Conversacion:
      type: object
      description: Información básica de una conversación
      properties:
        id:
          type: number
          description: Identificador único de la conversación
        titulo:
          type: string
          description: Título de la conversación
        fcreacion:
          type: string
          format: date-time
          description: Fecha de creación de la conversación
        idusuario:
          type: string
          description: Identificador del usuario asociado a la conversación
        idtemas:
          type: array
          items:
            type: number
          description: Identificadores de los temas asociados a la conversación

    Mensaje:
      type: object
      description: Información de un mensaje en una conversación
      properties:
        id:
          type: number
          description: Identificador único del mensaje
        emisor:
          type: string
          enum: [user, agent]
          description: Emisor del mensaje (usuario o agente)
        contenido:
          type: string
          description: Contenido del mensaje
        fecha_envio:
          type: string
          format: date-time
          description: Fecha y hora de envío del mensaje
        idconversacion:
          type: number
          description: Identificador de la conversación asociada
```



## Project setup
```bash
git clone https://github.com/juandiegoq56/Backend-LLM.git
cd backend-tutor-nivelador
```

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
