
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { GithubModule } from './github/github.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    WebhooksModule,
    GithubModule,
  ],
})
export class AppModule {}
