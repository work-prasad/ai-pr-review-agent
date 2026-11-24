import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksService } from './webhooks.service.js';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(HttpStatus.OK)
  handleGitHubWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Headers('x-github-event') event: string | undefined,
  ) {
    if (!request.rawBody) {
      throw new BadRequestException('Raw request body is unavailable');
    }

    this.webhooksService.verifySignature(request.rawBody, signature);

    const payload = request.body as
      | {
          action?: string;
        }
      | undefined;

    const action =
      payload && typeof payload === 'object' ? payload.action : undefined;

    const supported = this.webhooksService.isSupportedPullRequestEvent(
      event,
      action,
    );

    return {
      received: true,
      event: event ?? 'unknown',
      processed: supported,
    };
  }
}
