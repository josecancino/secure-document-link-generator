import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { GenerateLinkDto } from './interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Post('generate-link')
  generateLink(@Body() generateLinkDto: GenerateLinkDto) {
    return this.appService.generateLink(generateLinkDto.documentName);
  }

  @Get('docs/view/:token')
  redeemLink(@Param('token') token: string) {
    return this.appService.redeemLink(token);
  }

  @Get('debug')
  getAll() {
    return this.appService.findAllLinks();
  }
}
