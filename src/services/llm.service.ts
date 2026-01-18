// Importación de módulos necesarios de NestJS y otras librerías.
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Ollama } from 'ollama';
import * as math from 'mathjs';

// Decorador que indica que esta clase es un servicio inyectable en NestJS.
@Injectable()
export class LlmService {
  // Propiedad privada para almacenar la instancia de Ollama.
  private ollama: Ollama;

  // Constructor que inicializa la conexión con Ollama usando una URL definida en variables de entorno.
  constructor() {
    this.ollama = new Ollama({ host: process.env.URL_IA });
  }

  // Método para generar un embedding a partir de un contenido de texto.
  async generarEmbedding(contenido: string): Promise<number[]> {
    // Obtiene la URL para el servicio de embedding desde las variables de entorno.
    const embeddingUrl = process.env.EMBEDDING;
    // Lanza una excepción si la variable de entorno no está definida.
    if (!embeddingUrl) {
      throw new InternalServerErrorException('La variable EMBEDDING no está definida');
    }

    // Realiza una petición HTTP POST al servicio de embedding con el contenido proporcionado.
    const response = await fetch(embeddingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text', // Modelo usado para generar el embedding.
        prompt: contenido, // Contenido de texto para el cual se generará el embedding.
      }),
    });

    // Verifica si la respuesta de la petición no es exitosa y lanza un error en ese caso.
    if (!response.ok) {
      throw new Error(`Error al generar embedding: ${response.statusText}`);
    }

    // Parsea la respuesta JSON y retorna el embedding como un arreglo de números.
    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }

  // Método para calcular la similitud coseno entre dos vectores (embeddings).
  calcularSimilitud(a: number[], b: number[]): number {
    // Calcula el producto punto entre los dos vectores.
    const dot = math.dot(a, b) as number;
    // Calcula la norma (magnitud) de cada vector.
    const normaA = math.norm(a) as number;
    const normaB = math.norm(b) as number;

    // Retorna la similitud coseno como el producto punto dividido por el producto de las normas.
    return dot / (normaA * normaB);
  }

  // Método para generar una respuesta de texto usando el modelo de lenguaje de Ollama.
  async generarRespuesta(prompt: string): Promise<string> {
    try {
      // Genera una respuesta usando el modelo 'llama3.2:3b' con temperatura 0 (respuestas deterministas).
      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt,
        options: { temperature: 0 },
      });

      // Retorna la respuesta generada o un mensaje por defecto si no hay respuesta.
      return response.response || 'No se pudo generar una respuesta.';
    } catch (error: any) {
      // Maneja errores durante la generación de la respuesta, imprimiendo el error y retornando un mensaje genérico.
      console.error('Error al generar la respuesta con Ollama:', error.message);
      return 'Ocurrió un error al intentar generar la respuesta.';
    }
  }
}
