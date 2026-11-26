
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@octokit/app';
import { readFileSync } from 'node:fs';

@Injectable()
export class GithubService {
  private readonly githubApp: App;

  constructor(private readonly configService: ConfigService) {
    const appId = Number(
      this.configService.getOrThrow<string>('GITHUB_APP_ID'),
    );

    if (!Number.isInteger(appId) || appId <= 0) {
      throw new Error('GITHUB_APP_ID must be a valid positive integer');
    }

    const privateKeyPath =
      this.configService.getOrThrow<string>('GITHUB_PRIVATE_KEY_PATH');

    const privateKey = readFileSync(privateKeyPath, 'utf8');

    this.githubApp = new App({
      appId,
      privateKey,
    });
  }

  getApp(): App {
    return this.githubApp;
  }
}
