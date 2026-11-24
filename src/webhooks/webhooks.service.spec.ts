
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { WebhooksService } from './webhooks.service.js';

describe('WebhooksService', () => {
  let webhooksService: WebhooksService;

  const secret = 'test-webhook-secret';
  const rawBody = Buffer.from(
    JSON.stringify({ action: 'opened', number: 42 }),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue(secret),
          },
        },
      ],
    }).compile();

    webhooksService = module.get<WebhooksService>(WebhooksService);
  });

  it('should accept a valid GitHub signature', () => {
    const signature = `sha256=${createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')}`;

    expect(() =>
      webhooksService.verifySignature(rawBody, signature),
    ).not.toThrow();
  });

  it('should reject an invalid signature', () => {
    expect(() =>
      webhooksService.verifySignature(rawBody, 'sha256=invalid'),
    ).toThrow(UnauthorizedException);
  });

  it('should reject a missing signature', () => {
    expect(() =>
      webhooksService.verifySignature(rawBody, undefined),
    ).toThrow(UnauthorizedException);
  });

  it('should reject a missing webhook secret', async () => {
    const module = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    const service = module.get<WebhooksService>(WebhooksService);

    expect(() =>
      service.verifySignature(rawBody, 'sha256=anything'),
    ).toThrow(UnauthorizedException);
  });

    it('should accept a supported pull request event', () => {
    expect(
      webhooksService.isSupportedPullRequestEvent(
        'pull_request',
        'opened',
      ),
    ).toBe(true);
  });

  it('should reject an unsupported GitHub event', () => {
    expect(
      webhooksService.isSupportedPullRequestEvent(
        'issues',
        'opened',
      ),
    ).toBe(false);
  });

  it('should reject an unsupported pull request action', () => {
    expect(
      webhooksService.isSupportedPullRequestEvent(
        'pull_request',
        'closed',
      ),
    ).toBe(false);
  });
  
});
