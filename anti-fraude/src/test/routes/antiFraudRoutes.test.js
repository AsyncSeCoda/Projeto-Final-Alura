import {
  afterAll,
  afterEach, beforeAll, beforeEach, describe, expect, jest,
} from '@jest/globals';
import request from 'supertest';
import axios from 'axios';
import app from '../../app.js';
import antiFraude from '../../models/AntiFraude.js';

let server;
// Hooke
beforeEach(() => {
  const port = 8080;
  server = app.listen(port);
});
// Hooke
afterEach(() => {
  server.close();
});

let antiFraudeDadosSimulados = {
  idCliente: '649c8614e1f00a2ad708c999',
  idTransacao: '649eeba408ff56d483abbe34',
  status: 'Em análise',
};

let idResposta;
describe('POST em /antiFraud', () => {
  it('Deve criar uma análise de fraude com status Em análise', async () => {
    const resposta = await request(app)
      .post('/api/admin/antiFraud')
      .send(antiFraudeDadosSimulados)
      .expect(201);

    idResposta = resposta.body._id;

    expect(idResposta).toBeDefined();
  });

  it('Deve retornar erro 400: Bad Request', async () => {
    antiFraudeDadosSimulados = {
      idCliente: '649c8614e1f00a2ad708c999',
      idTransacao: 756362,
      status: 'Em análise',
    };

    await request(app)
      .post('/api/admin/antiFraud')
      .send(antiFraudeDadosSimulados)
      .expect(400);
  });
});

describe('GET em /antiFraud', () => {
  it('Deve retornar uma lista das análises pendentes', async () => {
    // jest.setTimeout(10000);
    const resposta = await request(app)
      .get('/api/admin/antiFraud')
      .set('Accept', 'application/json')
      .expect('content-type', /json/)
      .expect(200);

    expect(resposta.body[0].status).toEqual('Em análise');
  });

  it('Deve retornar erro 404: Not Found', async () => {
    jest.spyOn(antiFraude, 'find').mockResolvedValueOnce(null);

    await request(app)
      .get('/api/admin/antiFraud')
      .set('Accept', 'application/json')
      .expect(404);
  });
});

describe('GET em /antiFraud/id', () => {
  it('Deve retornar a análise de antifraude de ID especificado', async () => {
    const clienteDados = {
      idCliente: '649c8614e1f00a2ad708c999',
      nome: 'Exemplo de Cliente',
    };
    const transacaoDados = {
      idTransacao: '649eeba408ff56d483abbe34',
      valor: 100.0,
    };

    // Simulando requisição nas portas externas
    const mockCompleto = jest.spyOn(axios, 'get');
    // Simulando dados do cliente
    mockCompleto.mockResolvedValueOnce({ data: clienteDados });
    // Simulando dados de transição
    mockCompleto.mockResolvedValueOnce({ data: transacaoDados });

    const resposta = await request(app)
      .get(`/api/admin/antiFraud/${idResposta}`)
      .expect(200);

    expect(resposta.body).toEqual(expect.objectContaining({
      ...clienteDados,
      _id: idResposta,
      ...transacaoDados,
    }));
  });

  it('Deve retornar erro 404: Not Found', async () => {
    jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce(null);

    await request(app)
      .get('/api/admin/antiFraud/id_inexistente')
      .expect(404);
  });
});

describe('PUT em /antiFraud/:id', () => {
  it('Deve realizar o update do status de uma análise', async () => {
    const findByIdDados = {
      _id: idResposta,
      ...antiFraudeDadosSimulados,
    };
    // Simula a busca pelo ID em antifraude
    const findByIdMock = jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce(findByIdDados);
    // Simula a atualização do Antifraude
    const findByIdAndUpdateMock = jest.spyOn(antiFraude, 'findByIdAndUpdate').mockResolvedValueOnce();
    // Simulando a requisição para a rota externa
    const putTransactionMock = jest.spyOn(axios, 'put').mockResolvedValueOnce({ status: 204 });

    await request(app)
      .put(`/api/admin/antiFraud/${idResposta}`)
      .send({ status: 'Rejeitada' })
      .expect(200);

    // Verificando se as funções foram chamadas corretamente
    expect(findByIdMock).toHaveBeenCalledWith(idResposta);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(idResposta, { status: 'Rejeitada' });
    expect(putTransactionMock).toHaveBeenCalledWith(
      `http://localhost:3002/api/admin/transactions/${findByIdDados.idTransacao}`,
      { status: 'Rejeitada' },
    );
  });

  it('Deve retornar 404 para o caso de status Aprovada ou Rejeitada', async () => {
    const findByIdDados = {
      _id: idResposta,
      idCliente: '649c8614e1f00a2ad708c999',
      idTransacao: '649eeba408ff56d483abbe34',
      status: 'Aprovada',
    };
    jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce(findByIdDados);
    jest.spyOn(antiFraude, 'findByIdAndUpdate').mockResolvedValueOnce();
    jest.spyOn(axios, 'put').mockResolvedValueOnce();

    await request(app)
      .put(`/api/admin/antiFraud/${idResposta}`)
      .send({ status: 'Rejeitada' })
      .expect(404);
  });

  it('Deve retornar 404 para o caso de status diferente dos definidos', async () => {
    const findByIdDados = {
      _id: idResposta,
      idCliente: '649c8614e1f00a2ad708c999',
      idTransacao: '649eeba408ff56d483abbe34',
      status: 'APROVADAH',
    };
    jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce(findByIdDados);
    jest.spyOn(antiFraude, 'findByIdAndUpdate').mockResolvedValueOnce();
    jest.spyOn(axios, 'put').mockResolvedValueOnce();

    await request(app)
      .put(`/api/admin/antiFraud/${idResposta}`)
      .send({ status: 'Rejeitada' })
      .expect(404);
  });

  it('Deve retornar 404 para o caso de status diferente dos definidos', async () => {
    const findByIdDados = {
      _id: idResposta,
      idCliente: '649c8614e1f00a2ad708c999',
      idTransacao: '649eeba408ff56d483abbe34',
      status: 'Em análise',
    };
    jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce(findByIdDados);
    jest.spyOn(antiFraude, 'findByIdAndUpdate').mockResolvedValueOnce();
    jest.spyOn(axios, 'put').mockResolvedValueOnce();

    await request(app)
      .put(`/api/admin/antiFraud/${idResposta}`)
      .send({ status: 'Rejeitade' })
      .expect(404);
  });

  it('Deve retornar', async () => {
    jest.spyOn(antiFraude, 'findById').mockResolvedValueOnce({ status: '404' });
    jest.spyOn(antiFraude, 'findByIdAndUpdate').mockResolvedValueOnce();
    jest.spyOn(axios, 'put').mockResolvedValueOnce();

    await request(app)
      .put(`/api/admin/antiFraud/${idResposta}`)
      .send({ status: 'Rejeitada' })
      .expect(404);
  });
});
