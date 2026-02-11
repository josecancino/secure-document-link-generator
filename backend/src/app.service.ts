import {
  Injectable,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'bun:sqlite';
import { randomBytes } from 'crypto';

interface LinkRecord {
  token: string;
  documentName: string;
  createdAt: string;
  redeemedAt: string | null;
}

@Injectable()
export class AppService implements OnModuleInit {
  private db!: Database;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    this.db = new Database(':memory:');
    this.db.run(`
      CREATE TABLE IF NOT EXISTS links (
        token TEXT PRIMARY KEY,
        documentName TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        redeemedAt DATETIME
      )
    `);
  }

  generateLink(documentName: string): { token: string; link: string } {
    const token = randomBytes(32).toString('hex');

    this.db.run('INSERT INTO links (token, documentName) VALUES (?, ?)', [
      token,
      documentName,
    ]);

    const frontendHost =
      this.configService.get<string>('FRONTEND_HOST') ||
      'http://localhost:5173';
    const link = `${frontendHost}/docs/view/${token}`;

    return { token, link };
  }

  redeemLink(token: string): { documentName: string } {
    const query = this.db.query(`
      SELECT * FROM links 
      WHERE token = ? 
      AND redeemedAt IS NULL
    `);
    const link = query.get(token) as LinkRecord | null;

    if (!link) {
      throw new NotFoundException({ error: 'Invalid or expired link.' });
    }

    this.db.run(
      'UPDATE links SET redeemedAt = CURRENT_TIMESTAMP WHERE token = ?',
      [token],
    );

    return { documentName: link.documentName };
  }

  getHealth() {
    try {
      // Check if DB is responsive
      this.db.query('SELECT 1').get();
      return {
        status: 'ok',
        database: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return { status: 'error', database: 'disconnected' };
    }
  }

  findAllLinks() {
    return this.db.query("SELECT * FROM links").all();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
