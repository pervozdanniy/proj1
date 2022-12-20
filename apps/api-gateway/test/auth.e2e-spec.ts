import { REDIS_CLIENTS } from '@liaoliaots/nestjs-redis/dist/redis/redis.constants';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import request from 'supertest';
import configuration, { ConfigInterface } from '~common/config/configuration';
import { buildKey } from '~common/session/redis.store';
import { ApiExceptionFilter } from '~common/utils/filters/api-exception.filter';
import { AuthModule } from '../src/auth/auth.module';
import { UserModule } from '../src/user/user.module';
import createAuthService from './__mocks/auth.service';
import testConfig from './__mocks/configuration';
import createCoreService from './__mocks/core.service';
import redisClients, { redisProvider, redisStorage } from './__mocks/redis';
import { userStorage } from './__mocks/user.repository';

const mockUid = 'mock_uid';
jest.mock('uid-safe', () => async () => mockUid);

const password = 'test';
const hash = bcrypt.hashSync(password, 10);

const mockUser = {
  id: 1,
  username: 'test',
  email: 'test@test.com',
  password: hash,
  created_at: new Date(),
  updated_at: new Date(),
  country_id: 1,
  status: 'active',
};

describe('AuthService (e2e)', () => {
  let core: INestMicroservice;
  let auth: INestMicroservice;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [configuration, testConfig], isGlobal: true }), AuthModule, UserModule],
    })
      .overrideProvider(REDIS_CLIENTS)
      .useValue(redisClients)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ApiExceptionFilter());
    const config = app.get(ConfigService<ConfigInterface>);
    core = await createCoreService(config);
    auth = await createAuthService(config);

    await core.listen();
    await auth.listen();
    await app.init();
  });

  afterEach(() => {
    redisStorage.clear();
    userStorage.length = 0;
  });

  afterAll(async () => {
    await app.close();
    await auth.close();
    await core.close();
  });

  let access_token: string;

  it('logins with correct credentials and encodes proper session_id into token', async () => {
    userStorage.push(mockUser);

    const resp = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: mockUser.email, password })
      .expect(200);

    expect(resp.body).toHaveProperty('access_token');
    access_token = resp.body.access_token;
  });

  it('fails to login with incorrect credentials', async () => {
    userStorage.push(mockUser);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: mockUser.email, password: 'INCORRECT_PASSWORD' })
      .expect(401);

    return request(app.getHttpServer()).post('/auth/login').send({ login: 'INCORRECT_LOGIN', password }).expect(401);
  });

  describe('Registration', () => {
    it('creates a new user', async () => {
      const mockPayload = {
        email: 'mock@mock.com',
        username: 'mock',
        password: 'mock',
      };
      await request(app.getHttpServer()).post('/users').send(mockPayload).expect(201);
      expect(userStorage).toHaveLength(1);
      const createdUser = userStorage.find((u) => u.email === mockPayload.email);
      expect(createdUser).not.toBeUndefined();
      expect(bcrypt.compareSync(mockPayload.password, createdUser.password)).toBe(true);
    });

    it('validates missing field', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'mock@mock.com',
          password: 'mock',
        })
        .expect(400);
    });

    it('validates invalid email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'INVALID_EMAIL',
          username: 'mock',
          password: 'mock',
        })
        .expect(400);
    });

    it('ignores extra fields', async () => {
      const payload = {
        email: 'mock@mock.com',
        username: 'mock',
        password: 'mock',
        extraField1: 1,
        extraField2: 2,
      };
      await request(app.getHttpServer()).post('/users').send(payload).expect(201);
      const createdUser = userStorage.find((u) => u.email === payload.email);
      expect(createdUser).not.toHaveProperty('extraField1');
    });
  });

  describe('JWT', () => {
    it('generates valid token with proper payload', () => {
      const config = app.get(ConfigService<ConfigInterface>);
      const payload = jwt.verify(access_token, config.get('auth.jwt.secret', { infer: true })) as JwtPayload;

      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
      expect(payload.exp - payload.iat).toBeGreaterThanOrEqual(365 * 24 * 60 * 60);

      expect(payload).toHaveProperty('sub');
      expect(payload.sub).toEqual(mockUid);
    });
  });

  describe('Session', () => {
    it("reads authorized user's data", async () => {
      const spy = jest.spyOn(redisProvider, 'get').mockClear();
      const sessionId = 'existing_session_id';
      const sessionData = JSON.stringify({ user: mockUser });
      redisStorage.set(buildKey(sessionId), sessionData);

      const config = app.get(ConfigService<ConfigInterface>);
      const access_token = jwt.sign({ sub: sessionId }, config.get('auth.jwt.secret', { infer: true }));

      const resp = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buildKey(sessionId));

      expect(resp.body.id).toEqual(mockUser.id);
      expect(resp.body.email).toEqual(mockUser.email);
      expect(resp.body.username).toEqual(mockUser.username);
      expect(resp.body.password).toBeUndefined();
    });

    it('returns proper status on invalid session id', async () => {
      const spy = jest.spyOn(redisProvider, 'get').mockClear();
      const sessionId = 'invalid_session_id';

      const config = app.get(ConfigService<ConfigInterface>);
      const access_token = jwt.sign({ sub: sessionId }, config.get('auth.jwt.secret', { infer: true }));

      await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${access_token}`).expect(401);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(buildKey(sessionId));
    });

    it('immediately logs out on session destroy', async () => {
      const sessionId = 'existing_session_id';
      const sessionData = JSON.stringify({ user: mockUser });
      redisStorage.set(buildKey(sessionId), sessionData);

      const config = app.get(ConfigService<ConfigInterface>);
      const access_token = jwt.sign({ sub: sessionId }, config.get('auth.jwt.secret', { infer: true }));

      await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${access_token}`).expect(200);
      redisStorage.delete(buildKey(sessionId));
      await request(app.getHttpServer()).get('/auth/me').set('Authorization', `Bearer ${access_token}`).expect(401);
    });

    it('writes safe user data after successfull login', async () => {
      const spy = jest.spyOn(redisProvider, 'set').mockClear();
      userStorage.push(mockUser);

      await request(app.getHttpServer()).post('/auth/login').send({ login: mockUser.email, password }).expect(200);

      expect(spy).toBeCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(buildKey(mockUid));

      const session = JSON.parse(redisStorage.get(buildKey(mockUid)));
      expect(session).toHaveProperty('user');
      expect(session.user.id).toEqual(mockUser.id);
      expect(session.user.email).toEqual(mockUser.email);
      expect(session.user.password).toBeUndefined();
    });
  });
});
