import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'bun:sqlite';
import { randomBytes } from 'crypto';
import { LinkRecord, SECURITY_CONFIG } from './interfaces';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private db!: Database;

  constructor(private readonly configService: ConfigService) {}

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
    if (
      !documentName ||
      documentName.trim().length < SECURITY_CONFIG.DOCUMENT_NAME_MIN_LENGTH
    ) {
      throw new BadRequestException(
        `Document name must be at least ${SECURITY_CONFIG.DOCUMENT_NAME_MIN_LENGTH} characters long.`,
      );
    }

    if (documentName.length > SECURITY_CONFIG.DOCUMENT_NAME_MAX_LENGTH) {
      throw new BadRequestException(
        `Document name is too long (max ${SECURITY_CONFIG.DOCUMENT_NAME_MAX_LENGTH} characters).`,
      );
    }

    const token = randomBytes(32).toString('hex');

    this.db.run('INSERT INTO links (token, documentName) VALUES (?, ?)', [
      token,
      documentName,
    ]);

    const frontendHost =
      this.configService.get<string>('FRONTEND_HOST') ||
      'http://localhost:5173';
    const link = `${frontendHost}/docs/view/${token}`;

    this.logger.log(
      `[DEBUG_TRACE]: Generated link for document: "${documentName}" (Token: ${token.substring(0, 8)}...)`,
    );

    return { token, link };
  }

  redeemLink(token: string): { documentName: string } {
    const query = this.db.query(`
      SELECT * FROM links 
      WHERE token = ? 
      AND redeemedAt IS NULL
      AND createdAt >= datetime('now', '-${SECURITY_CONFIG.TOKEN_EXPIRATION_MINUTES} minutes')
    `);
    const link = query.get(token) as LinkRecord | null;

    if (!link) {
      throw new NotFoundException({ error: 'Invalid or expired link.' });
    }

    this.db.run(
      'UPDATE links SET redeemedAt = CURRENT_TIMESTAMP WHERE token = ?',
      [token],
    );

    this.logger.log(
      `[DEBUG_TRACE]: Link redeemed for document: "${link.documentName}" (Token: ${token.substring(0, 8)}...)`,
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
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }

  findAllLinks() {
    return this.db.query('SELECT * FROM links').all();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
