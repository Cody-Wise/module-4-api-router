const { setupDb, signUpUser } = require('./utils.js');
const request = require('supertest');
const app = require('../lib/app');

describe('/api/v1/auth', () => {
  beforeEach(setupDb);

  it('/signup', async () => {
    const { agent, user, credentials } = await signUpUser();

    expect(user).toEqual({
      id: expect.any(Number),
      email: credentials.email,
    });

    const { statusCode } = await agent.get('/api/v1/auth/verify');
    expect(statusCode).toBe(200);
  });

  it('/signup with duplicate email', async () => {
    await signUpUser();
    const { res } = await signUpUser();
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      message: 'Email already exists',
    });
  });

  it('/signin', async () => {
    const { credentials } = await signUpUser();

    const agent = request.agent(app);
    const res = await agent.post('/api/v1/auth/signin').send(credentials);

    expect(res.body).toEqual({
      id: expect.any(Number),
      email: credentials.email,
    });

    const { statusCode } = await agent.get('/api/v1/auth/verify');
    expect(statusCode).toBe(200);
  });

  it('/signin bad email, bad password', async () => {
    const { credentials } = await signUpUser();

    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ ...credentials, email: 'bad@email.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      message: 'Invalid credentials',
    });

    const res2 = await request(app)
      .post('/api/v1/auth/signin')
      .send({ ...credentials, password: 'badpassword' });

    expect(res2.statusCode).toBe(400);
    expect(res2.body).toEqual({
      status: 400,
      message: 'Invalid credentials',
    });
  });

  it('/signout', async () => {
    const { agent } = await signUpUser();

    const { body } = await agent.delete('/api/v1/auth/signout');
    expect(body).toEqual({ success: true });

    const { statusCode } = await agent.get('/api/v1/auth/verify');
    expect(statusCode).toBe(401);
  });
});
