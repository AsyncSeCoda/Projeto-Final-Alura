/* eslint-disable no-undef */
import request from 'supertest';
import {
  describe, expect, it,
} from '@jest/globals';
import dotenv from 'dotenv';
import app from '../../app.js';

dotenv.config();

describe('Routes Accounts and Clientes', () => {
  let idCreteForTest;
  let idClient;
  let idAccount;
  let token;

  it('should return all accounts. Route /api/admin/accounts', async () => {
    const response = await request(app)
      .get('/api/admin/accounts');

    const { body } = response;
    const { _id } = body[0];

    idAccount = _id;

    expect(response.status).toBe(200);
    expect(body[0]).toHaveProperty('_id');
    expect(body[0]).toHaveProperty('nome');
    expect(body[0]).toHaveProperty('email');
    expect(body[0]).toHaveProperty('senha');
  });

  it('should return a account by ID. Route /api/admin/accounts/:id', async () => {
    const response = await request(app)
      .get(`/api/admin/accounts/${idAccount}`);

    const { body } = response;
    const { _id } = body;

    expect(response.status).toBe(200);
    expect(_id).toBe(idAccount);
    expect(body).toHaveProperty('_id');
    expect(body).toHaveProperty('nome');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('senha');
  });

  it('should create a account. Route /api/admin/accounts', async () => {
    const account = {
      nome: 'Teste',
      email: 'teste@test.com',
      senha: '123456',
    };
    const response = await request(app)
      .post('/api/admin/accounts').send(account);

    const { body } = response;
    const { _id } = body;
    idCreteForTest = _id;
    expect(response.status).toBe(201);
    expect(body).toHaveProperty('nome');
    expect(body.nome).toBe('Teste');
    expect(body).toHaveProperty('email');
    expect(body.email).toBe('teste@test.com');
    expect(body).toHaveProperty('senha');
    expect(body).toHaveProperty('_id');
  });

  it('should return token Bearer. Route /api/accounts/login', async () => {
    const accountLogin = {
      email: 'teste@test.com',
      senha: '123456',
    };

    const response = await request(app)
      .post('/api/accounts/login').send(accountLogin);

    const { headers: { authorization } } = response;
    token = authorization.split(' ')[1];
    expect(response.status).toBe(204);
    expect(authorization).not.toBeNull();
    expect(authorization).not.toBeUndefined();
  });

  it('should update a account. Route /api/admin/accounts/:id', async () => {
    const account = {
      nome: 'Teste2',
      email: 'teste@test.com',
      senha: '123456',
    };

    const response = await request(app)
      .put(`/api/admin/accounts/${idCreteForTest}`).send(account);

    expect(response.status).toBe(204);

    const accountUpdate = await request(app)
      .get(`/api/admin/accounts/${idCreteForTest}`);

    expect(accountUpdate.body).toHaveProperty('nome');
    expect(accountUpdate.body.nome).toBe('Teste2');
  });

  it('should list all clients. Route /api/admin/clients', async () => {
    const response = await request(app)
      .get('/api/admin/clients');

    expect(response.status).toBe(200);

    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0].dadosPessoais).toHaveProperty('nome');
    expect(response.body[0].dadosPessoais).toHaveProperty('cpf');
    expect(response.body[0].dadosPessoais).toHaveProperty('email');
    expect(response.body[0].dadosPessoais).toHaveProperty('telefone');
    expect(response.body[0].dadosPessoais).toHaveProperty('rendaMensal');
    expect(response.body[0]).toHaveProperty('endereco');
    expect(response.body[0]).toHaveProperty('cartao');
  });

  it('should insert a client. Route /api/admin/clients', async () => {
    const client = {
      dadosPessoais: {
        nome: 'Teste',
        cpf: '12345678910',
        email: 'test@test.com',
        telefone: '12345678910',
        rendaMensal: 4000.00,
      },
      endereco: {
        rua: 'Rua A',
        numero: 1234,
        complemento: 'S/N',
        cep: '12345678',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      cartao: {
        numeroCartao: '1234567891234567',
        nomeCartao: 'Teste',
        validadeCartao: '05/2024',
        cvcCartao: '323',
        vencimentoFatura: '01',
      },
    };

    const response = await request(app)
      .post('/api/admin/clients')
      .send(client)
      .set('Authorization', `Bearer ${token}`);

    const { _id } = response.body;
    idClient = _id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('dadosPessoais');
    expect(response.body).toHaveProperty('endereco');
    expect(response.body).toHaveProperty('cartao');
  });

  it('should return a client by ID. Route /api/admin/clients/:id', async () => {
    const response = await request(app)
      .get(`/api/admin/clients/${idClient}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('dadosPessoais');
    expect(response.body.dadosPessoais).toHaveProperty('nome');
    expect(response.body.dadosPessoais.nome).toBe('Teste');
    expect(response.body.dadosPessoais).toHaveProperty('cpf');
    expect(response.body.dadosPessoais.cpf).toBe('12345678910');
    expect(response.body.dadosPessoais).toHaveProperty('email');
    expect(response.body.dadosPessoais.email).toBe('test@test.com');
    expect(response.body).toHaveProperty('endereco');
  });

  it('should find a client by date card. Route /api/admin/clients', async () => {
    const response = await request(app)
      .get('/api/admin/clients/card?numeroCartao=1234567891234567&nomeCartao=Teste&validadeCartao=05/2024&cvcCartao=323&vencimentoFatura=01');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('idCliente');
    expect(response.body).toHaveProperty('rendaMensal');
  });

  it('should update a client. Route /api/admin/clients/:id', async () => {
    const clientForUpdate = {
      dadosPessoais: {
        nome: 'teste update',
        cpf: '11111111111',
        email: 'test@test.com',
        telefone: '12345678910',
        rendaMensal: 4000.00,
      },
      endereco: {
        rua: 'Rua A',
        numero: 1234,
        complemento: 'S/N',
        cep: '12345678',
        cidade: 'São Paulo',
        uf: 'SP',
      },
      cartao: {
        numeroCartao: '1234567891234567',
        nomeCartao: 'Teste',
        validadeCartao: '05/2024',
        cvcCartao: '323',
        vencimentoFatura: '01',
      },
    };

    const response = await request(app)
      .put(`/api/admin/clients/${idClient}`)
      .send(clientForUpdate);

    expect(response.status).toBe(200);

    const clientUpdate = await request(app)
      .get(`/api/admin/clients/${idClient}`);

    console.log(clientUpdate.body);
    expect(clientUpdate.body).toHaveProperty('dadosPessoais');
    expect(clientUpdate.body.dadosPessoais).toHaveProperty('nome');
    expect(clientUpdate.body.dadosPessoais.nome).toBe('teste update');
    expect(clientUpdate.body.dadosPessoais).toHaveProperty('cpf');
    expect(clientUpdate.body.dadosPessoais.cpf).toBe('11111111111');
    expect(clientUpdate.body).toHaveProperty('endereco');
  });

  it('should delete a client. Route /api/admin/clients/:id', async () => {
    const response = await request(app)
      .delete(`/api/admin/clients/${idClient}`);

    expect(response.status).toBe(200);
  });

  it('should delete a account. Route /api/admin/accounts/:id', async () => {
    const response = await request(app)
      .delete(`/api/admin/accounts/${idCreteForTest}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});
