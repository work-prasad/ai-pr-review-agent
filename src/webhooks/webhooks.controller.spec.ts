import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let webhooksService: {
    verifySignature: ReturnType<typeof vi.fn>;
    isSupportedPullRequestEvent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    webhooksService = {
      verifySignature: vi.fn(),
      isSupportedPullRequestEvent: vi.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: webhooksService,
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should acknowledge a valid GitHub webhook', () => {
    const rawBody = Buffer.from('{"action":"opened"}');

    const request = {
      rawBody,
      body: {
        action: 'opened',
      },
    } as RawBodyRequest<Request>;

    const result = controller.handleGitHubWebhook(
      request,
      'sha256=valid-signature',
      'pull_request',
    );

    expect(webhooksService.verifySignature).toHaveBeenCalledWith(
      rawBody,
      'sha256=valid-signature',
    );

    expect(result).toEqual({
      received: true,
      event: 'pull_request',
      processed: true,
    });
  });

  it('should reject a webhook when the signature is invalid', () => {
    webhooksService.verifySignature.mockImplementation(() => {
      throw new UnauthorizedException('Invalid webhook signature');
    });

    const request = {
      rawBody: Buffer.from('{"action":"opened"}'),
    } as RawBodyRequest<Request>;

    expect(() =>
      controller.handleGitHubWebhook(request, 'sha256=invalid', 'pull_request'),
    ).toThrow(UnauthorizedException);
  });

  it('should reject requests without a raw body', () => {
    const request = {} as RawBodyRequest<Request>;

    expect(() =>
      controller.handleGitHubWebhook(
        request,
        'sha256=valid-signature',
        'pull_request',
      ),
    ).toThrow(BadRequestException);

    expect(webhooksService.verifySignature).not.toHaveBeenCalled();
  });

  it('should acknowledge but not process unsupported events', () => {
    webhooksService.isSupportedPullRequestEvent.mockReturnValue(false);

    const request = {
      rawBody: Buffer.from('{"action":"opened"}'),
      body: {
        action: 'opened',
      },
    } as RawBodyRequest<Request>;

    const result = controller.handleGitHubWebhook(
      request,
      'sha256=valid-signature',
      'issues',
    );

    expect(result).toEqual({
      received: true,
      event: 'issues',
      processed: false,
    });
  });
});
