import { INestApplication, INestMicroservice } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import request from 'supertest';
import { ConfigInterface } from '~common/config/configuration';
import { authClientStorage } from './__mocks/auth-client.repository';
import createAuth from './__mocks/auth.app';
import createCore from './__mocks/core.app';
import createSdkGateway from './__mocks/sdk-gateway.app';
import { userStorage } from './__mocks/user.repository';

describe('SDK Auth client (signed)', () => {
  let core: INestMicroservice;
  let auth: INestMicroservice;
  let app: INestApplication;

  beforeAll(async () => {
    app = await createSdkGateway();
    const config = app.get(ConfigService<ConfigInterface>);
    core = await createCore(config);
    auth = await createAuth(config);

    await core.listen();
    await auth.listen();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await auth.close();
    await core.close();
  });

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  let apiKey: string;

  it('creates auth client with signature', async () => {
    const pub_key = publicKey.export({ format: 'der', type: 'spki' }).toString('hex');
    const resp = await request(app.getHttpServer()).post('/clients').send({ name: 'mock_client', pub_key }).expect(201);
    expect(resp.body.is_secure).toBe(true);
    apiKey = resp.body.key;
    const stored = authClientStorage.find((e) => e.key === apiKey);
    expect(stored.secret).toEqual(pub_key);
  });

  it('registers user for auth client', async () => {
    const payload = { login: 'mock_user_1', countryCode: 'US' };
    const sign = crypto.sign(null, Buffer.from(JSON.stringify(payload)), privateKey).toString('hex');
    await request(app.getHttpServer())
      .post('/clients/register')
      .set('signature', sign)
      .set('api-key', apiKey)
      .send(payload)
      .expect(201);
    expect(userStorage).toHaveLength(1);
    expect(userStorage[0]).not.toHaveProperty('password');
    expect(userStorage[0].email).toEqual('mock_user_1');
  });

  it('fails to register with malformed payload', async () => {
    const payload = { login: 'mock_user_2', countryCode: 'US' };
    const sign = crypto.sign(null, Buffer.from(JSON.stringify(payload)), privateKey).toString('hex');
    await request(app.getHttpServer())
      .post('/clients/register')
      .set('signature', sign)
      .set('api-key', apiKey)
      .send({ login: 'mock_user_2+', countryCode: 'US' })
      .expect(401);
  });

  it('does not asccept unsigned input', async () => {
    const payload = { login: 'mock_user_2', countryCode: 'US' };
    await request(app.getHttpServer()).post('/clients/register').set('api-key', apiKey).send(payload).expect(400);
  });

  it('logins previously registered user', async () => {
    const payload = { login: 'mock_user_1' };
    const sign = crypto.sign(null, Buffer.from(JSON.stringify(payload)), privateKey).toString('hex');
    await request(app.getHttpServer())
      .post('/clients/login')
      .set('signature', sign)
      .set('api-key', apiKey)
      .send(payload)
      .expect(201);
  });
});
