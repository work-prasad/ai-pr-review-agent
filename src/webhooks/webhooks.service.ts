import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class WebhooksService {
  constructor(private readonly configService: ConfigService) {}

  verifySignature(rawBody: Buffer, signature: string | undefined): void {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');

    if (!secret || !signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const expectedSignature = `sha256=${createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')}`;

    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  isSupportedPullRequestEvent(
    event: string | undefined,
    action: string | undefined,
  ): boolean {
    if (event !== 'pull_request') {
      return false;
    }

    const supportedActions = ['opened', 'synchronize', 'reopened'];

    return action !== undefined && supportedActions.includes(action);
  }
}
