import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface GenerateLinkResponse {
  token: string;
  link: string;
}

interface ViewDocumentResponse {
  documentName: string;
}

interface ErrorResponse {
  error: string;
}

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let storedToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api');
    // Enable the logger so we can see the "trace" of the application logic
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/health (GET)', async () => {
    console.log('TRACE: [GET /api/health] Checking system health...');
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    console.log('TRACE: [GET /api/health] System is healthy!');
  });

  it('/api/generate-link (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: 'test-doc.pdf' })
      .expect(201);

    const body = response.body as GenerateLinkResponse;

    expect(body.token).toBeDefined();
    expect(body.link).toBeDefined();
    expect(body.link).toContain('/docs/view/');

    storedToken = body.token;
  });

  it('/api/generate-link (POST) - Fail (Validation)', async () => {
    // Empty name
    await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: '' })
      .expect(400);

    // Too short
    await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: 'ab' })
      .expect(400);

    // Too long (over 50)
    await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: 'a'.repeat(51) })
      .expect(400);
  });

  it('/api/debug (GET) - Check initial state', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/debug')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Session Flow: Generate multiple links and redeem them', async () => {
    // 1. Generate link for Doc A
    const resA = await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: 'Doc-A.pdf' })
      .expect(201);
    const tokenA = resA.body.token;

    // 2. Generate link for Doc B
    const resB = await request(app.getHttpServer())
      .post('/api/generate-link')
      .send({ documentName: 'Doc-B.pdf' })
      .expect(201);
    const tokenB = resB.body.token;

    // 3. Debug should show both
    const debugRes = await request(app.getHttpServer())
      .get('/api/debug')
      .expect(200);
    expect(debugRes.body.length).toBeGreaterThanOrEqual(3); // +1 from previous test

    // 4. Redeem Doc B first
    const viewB = await request(app.getHttpServer())
      .get(`/api/docs/view/${tokenB}`)
      .expect(200);
    expect(viewB.body.documentName).toBe('Doc-B.pdf');

    // 5. Try Doc B again (should fail)
    await request(app.getHttpServer())
      .get(`/api/docs/view/${tokenB}`)
      .expect(404);

    // 6. Redeem Doc A (should still work)
    const viewA = await request(app.getHttpServer())
      .get(`/api/docs/view/${tokenA}`)
      .expect(200);
    expect(viewA.body.documentName).toBe('Doc-A.pdf');
  });

  it('/api/docs/view/:token (GET) - Fail (Invalid Token)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs/view/invalid-token-123')
      .expect(404);

    expect(response.body.error).toEqual('Invalid or expired link.');
  });
});
