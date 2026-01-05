import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { Response } from 'express';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() body: { prompt: string; currentCode?: string }, @Res() res: Response) {
    try {
      const result = await this.aiService.generateCode(body.prompt, body.currentCode);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
