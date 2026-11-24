
import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
  });

  it('should return the application health status', () => {
    const result = healthService.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('ai-pr-review-agent');
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
