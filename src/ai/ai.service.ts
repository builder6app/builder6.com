import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
  }

  async generateCode(prompt: string, currentCode?: string) {
    const systemPrompt = `You are an expert web developer and UI designer. 
    Your task is to generate or modify HTML/Tailwind CSS code based on the user's request.
    
    If 'currentCode' is provided, you should modify it according to the user's instructions.
    If 'currentCode' is not provided, you should generate a new page from scratch.
    
    Return ONLY the HTML code. Do not include markdown backticks or explanations.
    Ensure the code is a complete HTML fragment or full page as appropriate, but primarily focus on the body content or the specific component requested.
    If the user asks for a full page, include <html>, <head>, <body> tags.
    Use Tailwind CSS for styling.
    `;

    const userMessage = currentCode 
      ? `Current Code:\n${currentCode}\n\nUser Request: ${prompt}`
      : `User Request: ${prompt}`;

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: 'gpt-4o',
    });

    let content = completion.choices[0].message.content || '';
    
    // Clean up markdown code blocks if present
    if (content.startsWith('```html')) {
      content = content.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return { code: content };
  }
}
