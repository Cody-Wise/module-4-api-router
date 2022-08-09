const request = require('supertest');
const { setupDb, signUpUser } = require('./utils.js');
const app = require('../lib/app');

describe('/api/v1/todos', () => {
  beforeEach(setupDb);

  it('POST / creates a new shopping item with the current user', async () => {
    const { agent, user } = await signUpUser();

    const newTask = { task: 'Mow Lawn', completed: true };
    const { status, body } = await agent.post('/api/v1/todos').send(newTask);

    expect(status).toEqual(200);
    expect(body).toEqual({
      ...newTask,
      id: expect.any(Number),
      user_id: user.id,
      completed: true,
    });
  });

  it('GET / returns all ss associated with the authenticated User', async () => {
    // create a user
    const { agent } = await signUpUser();
    const { body: user1Todo } = await agent.post('/api/v1/todos').send({
      task: 'Wash Windows',
      completed: true,
    });

    const { agent: agent2 } = await signUpUser({
      email: 'user2@email.com',
      password: 'password',
    });

    const { body: user2Todo } = await agent2.post('/api/v1/todos').send({
      task: 'Mow Lawn',
      completed: true,
    });

    const resp1 = await agent.get('/api/v1/todos');
    expect(resp1.status).toEqual(200);
    expect(resp1.body).toEqual([user1Todo]);

    const resp2 = await agent2.get('/api/v1/todos');
    expect(resp2.status).toEqual(200);
    expect(resp2.body).toEqual([user2Todo]);
  });

  it('GET /:id should get an item', async () => {
    const { agent } = await signUpUser();

    const { body: todo } = await agent.post('/api/v1/todos').send({
      task: 'Mow Lawn',
      completed: true,
    });
    expect(todo.id).toEqual(1);
    const { status, body: got } = await agent.get(`/api/v1/todos/${todo.id}`);

    expect(status).toBe(200);
    expect(got).toEqual(todo);
  });

  it('GET / should return a 401 if not authenticated', async () => {
    const { status } = await request(app).get('/api/v1/todos');
    expect(status).toEqual(401);
  });

  it('UPDATE /:id should update an item', async () => {
    const { agent } = await signUpUser();

    const { body: todo } = await agent.post('/api/v1/todos').send({
      task: 'Mow Lawn',
      completed: true,
    });

    const { status, body: updated } = await agent
      .put(`/api/v1/todos/${todo.id}`)
      .send({ completed: true });

    expect(status).toBe(200);
    expect(updated).toEqual({ ...todo, completed: true });
  });

  it('UPDATE /:id should 403 for invalid users', async () => {
    const { agent } = await signUpUser();

    const { body: todo } = await agent.post('/api/v1/todos').send({
      task: 'Mow Lawn',
      completed: true,
    });

    const { agent: agent2 } = await signUpUser({
      email: 'user2@email.com',
      password: 'password',
    });

    const { status, body } = await agent2
      .put(`/api/v1/todos/${todo.id}`)
      .send({ bought: true });

    expect(status).toBe(403);
    expect(body).toEqual({
      status: 403,
      message: 'You do not have access to view this page',
    });
  });

  it('DELETE /:id should delete todos for valid user', async () => {
    const { agent } = await signUpUser();

    const { body: todo } = await agent.post('/api/v1/todos').send({
      task: 'Mow Lawn',
      completed: true,
    });

    const { status, body } = await agent.delete(`/api/v1/todos/${todo.id}`);
    expect(status).toBe(200);
    expect(body).toEqual(todo);

    const { body: todos } = await agent.get('/api/v1/todos');

    expect(todos.length).toBe(0);
  });
});
