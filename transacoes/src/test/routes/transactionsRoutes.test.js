import {
  afterEach, beforeEach, describe, expect, it,
} from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

let server;

beforeEach(() => {
  const port = 8080;
  server = app.listen(port);
});

afterEach(() => {
  server.close();
});

let idRespostaAccount;

describe('POST em /accounts', () => {
  it('Deve criar um novo Account', async () => {
    const resposta = await request(app)
      .post('/api/admin/accounts')
      .send({
        nome: 'Gabriela',
        email: 'gabriela.riedel3@asyncsecoda.com',
        senha: '123456',
      })
      .expect(201);
    idRespostaAccount = resposta.body._id;
  });
});

let token;

describe('POST em /accounts/login', () => {
  it('Faz um login com o usuário criado em accounts', async () => {
    const resposta = await request(app)
      .post('/api/accounts/login')
      .send({
        email: 'gabriela.riedel3@asyncsecoda.com',
        senha: '123456',
      })
      .expect(204);
    token = resposta.headers.authorization;
  });
});

let idRespostaAprovada;

describe('POST em /transactions', () => {
  it('Deve criar uma nova transação com status "Aprovada"', async () => {
    const resposta = await request(app)
      .post('/api/admin/transactions')
      .send({
        valor: 1500,
        numeroCartao: '5291559458459072',
        nomeCartao: 'Gabriela Riedel',
        validadeCartao: '05/2024',
        cvcCartao: '378',
        vencimentoFatura: '01',
      })
      .set('Authorization', token)
      .expect(201);
    idRespostaAprovada = resposta.body.id;
  });
});

let idRespostaEmAnalise;

describe('POST em /transactions', () => {
  it('Deve criar uma nova transação com status "Em análise"', async () => {
    const resposta = await request(app)
      .post('/api/admin/transactions')
      .send({
        valor: 3000,
        numeroCartao: '5291559458459072',
        nomeCartao: 'Gabriela Riedel',
        validadeCartao: '05/2024',
        cvcCartao: '378',
        vencimentoFatura: '01',
      })
      .set('Authorization', token);
    idRespostaEmAnalise = resposta.body.id;
    expect(resposta.body).toHaveProperty('status');
  });
});

describe('GET em /transactions', () => {
  it('Deve retornar uma lista de transações', async () => {
    const resposta = await request(app)
      .get('/api/admin/transactions')
      .set('Accept', 'aplication/json')
      .expect('content-type', /json/)
      .expect(200);
    expect(resposta.body[0]).toHaveProperty('status');
  });
});

describe('GET em /transactions/id', () => {
  it('Deve retornar a transação adicionada', async () => {
    await request(app)
      .get(`/api/admin/transactions/${idRespostaAprovada}`);
  });
});

describe('PUT em /transactions/id', () => {
  it('Deve alterar o campo status', async () => {
    await request(app)
      .put(`/api/admin/transactions/${idRespostaEmAnalise}`)
      .send({ status: 'Rejeitada' })
      .expect(204);
  });
});

describe('DELETE em /transactions/id', () => {
  it('Deve deletar a transação adicionada "Aprovada"', async () => {
    await request(app)
      .delete(`/api/admin/transactions/${idRespostaAprovada}`)
      .expect(204);
  });
  it('Deve deletar a transação adicionada "Em análise"', async () => {
    await request(app)
      .delete(`/api/admin/transactions/${idRespostaEmAnalise}`)
      .expect(204);
  });
});

describe('DELETE em /accounts/id', () => {
  it('Deve deletar o account adicionado', async () => {
    await request(app)
      .delete(`/api/admin/accounts/${idRespostaAccount}`)
      .expect(204);
  });
});
