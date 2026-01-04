import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { Db } from 'mongodb';

@Injectable()
export class AuthService implements OnModuleInit {
  public auth: ReturnType<typeof betterAuth>;

  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  onModuleInit() {
    this.auth = betterAuth({
      database: mongodbAdapter(this.db),
      user: {
        modelName: 'better_users',
      },
      session: {
        modelName: 'better_sessions',
      },
      account: {
        modelName: 'better_accounts',
      },
      verification: {
        modelName: 'better_verifications',
      },
      advanced: {
        // @ts-ignore
        database: {
            generateId: () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                for (let i = 0; i < 24; i++) {
                  result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            }
        }
      },
      emailAndPassword: {
        enabled: true,
      },
    });
  }
}
