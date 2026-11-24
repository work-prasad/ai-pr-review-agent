
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'ai-pr-review-agent',
      timestamp: new Date().toISOString(),
    };
  }
}
