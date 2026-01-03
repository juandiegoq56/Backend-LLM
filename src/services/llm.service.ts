import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Ollama } from 'ollama';
import * as math from 'mathjs';
@Injectable()
export class LlmService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({ host: 'https://0x4kt4cc-11434.use2.devtunnels.ms' });
  }

  async generarEmbedding(contenido: string): Promise<number[]> {
    const embeddingUrl = process.env.EMBEDDING;
    if (!embeddingUrl) {
      throw new InternalServerErrorException('La variable EMBEDDING no está definida');
    }

    const response = await fetch(embeddingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: contenido,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al generar embedding: ${response.statusText}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    return data.embedding;
  }

  calcularSimilitud(a: number[], b: number[]): number {
    const dot = math.dot(a, b) as number;
    const normaA = math.norm(a) as number;
    const normaB = math.norm(b) as number;

    return dot / (normaA * normaB);
  }

  async generarRespuesta(prompt: string): Promise<string> {
    try {
      const response = await this.ollama.generate({
        model: 'llama3.2:3b',
        prompt,
        options: { temperature: 0 },
      });

      return response.response || 'No se pudo generar una respuesta.';
    } catch (error: any) {
      console.error('Error al generar la respuesta con Ollama:', error.message);
      return 'Ocurrió un error al intentar generar la respuesta.';
    }
  }
}
