
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import { GithubService } from './github.service.js';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

describe('GithubService', () => {
  let service: GithubService;

  const configServiceMock = {
    getOrThrow: vi.fn((key: string) => {
      if (key === 'GITHUB_APP_ID') {
        return '123456';
      }

      if (key === 'GITHUB_PRIVATE_KEY_PATH') {
        return '/fake/private-key.pem';
      }

      throw new Error(`Unexpected config key: ${key}`);
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(readFileSync).mockReturnValue(
      'test-private-key',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
