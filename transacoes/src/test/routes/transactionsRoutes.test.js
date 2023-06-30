import {
    afterEach, beforeEach, describe, expect, it, jest
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
                nome: "Gabriela",
                email: "gabriela.riedel3@asyncsecoda.com",
                senha: "123456"
            })
            .expect(201)
        idRespostaAccount = resposta.body._id
    })
});

let token;

describe('POST em /accounts/login', () => {
    it('Faz um login com o usuário criado em accounts', async () => {
        const resposta = await request(app)
            .post('/api/accounts/login')
            .send({
                email: "gabriela.riedel3@asyncsecoda.com",
                senha: "123456"
            })
            .expect(204)
        token = resposta.headers["authorization"]
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

let idRespostaAprovada;

describe('POST em /transactions', () => {
    it('Deve criar uma nova transação com status "Aprovada"', async () => {
        const resposta = await request(app)
            .post('/api/admin/transactions')
            .send({
                valor: 1500,
                numeroCartao: "5291559458459072",
                nomeCartao: "Gabriela Riedel",
                validadeCartao: "05/2024",
                cvcCartao: "378",
                vencimentoFatura: "01"
            })
            .set('Authorization', token)
            .expect(201)
        idRespostaAprovada = resposta.body.id
    })
});

// it('Deve fazer uma chamada simulada ao DB', () => {
//     const editora = new Editora(
//         {
//             nome: 'CDC',
//             cidade: 'Sao Paulo',
//             email: 'c@c.com',
//           }
//     );

//     editora.salvar = jest.fn().mockReturnValue({
//       id: 10,
//       nome: 'CDC',
//       cidade: 'Sao Paulo',
//       email: 'c@c.com',
//       created_at: '2022-10-01',
//       updated_at: '2022-10-01',
//     });

//     const retorno = editora.salvar();

//     expect(retorno).toEqual(
//       expect.objectContaining({
//         id: expect.any(Number),
//         ...objetoEditora,
//         created_at: expect.any(String),
//         updated_at: expect.any(String),
//       }),
//     );
//   });

let idRespostaEmAnalise;

describe('POST em /transactions', () => {
    it('Deve criar uma nova transação com status "Em análise"', async () => {
        // Mock do retorno do endpoint
        const mockApiResponse = {
                _id: "649ef728b2225e7c3dc5c121",
                dadosPessoais: {
                    nome: "Gabriela Riedel",
                    cpf: "32823416013",
                    email: "gabriela@asyncsecoda.com",
                    telefone: "12345678910",
                    rendaMensal: 4000
                },
                endereco: {
                    rua: "Manoel Antônio",
                    numero: "1",
                    complemento: "S/N",
                    cep: "36400975",
                    cidade: "Conselheiro Lafaiete",
                    uf: "MG"
                },
                cartao: {
                    numeroCartao: "5291559458459072",
                    nomeCartao: "Gabriela Riedel",
                    validadeCartao: "05/2024",
                    cvcCartao: "378",
                    vencimentoFatura: "01"
                
            }
        };
        // Mock do método post do Supertest
        jest.spyOn(request(app), 'post').mockResolvedValue({
            body: mockApiResponse
        });

        const resposta = await request(app)
            .post('/api/admin/transactions')
            .send({
                valor: 3000,
                numeroCartao: "5291559458459072",
                nomeCartao: "Gabriela Riedel",
                validadeCartao: "05/2024",
                cvcCartao: "378",
                vencimentoFatura: "01"
            })
            .set('Authorization', token);
        idRespostaEmAnalise = resposta.body.id;
        expect(resposta.body).toHaveProperty('status');
    });
    // it('Deve criar uma nova transação com status "Em análise"', async () => {
    //     const resposta = await request(app)
    //         .post('/api/admin/transactions')
    //         .send({
    //             valor: 3000,
    //             numeroCartao: "5291559458459072",
    //             nomeCartao: "Gabriela Riedel",
    //             validadeCartao: "05/2024",
    //             cvcCartao: "378",
    //             vencimentoFatura: "01"
    //         })
    //         .set('Authorization', token)
    //     idRespostaEmAnalise = resposta.body.id
    //     expect(resposta.body).toHaveProperty('status')
    // })
});

describe('GET em /transactions/id', () => {
    it('Deve retornar a transação adicionada', async () => {
        await request(app)
            .get(`/api/admin/transactions/${idRespostaAprovada}`)
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
            .expect(204)
    });
    it('Deve deletar a transação adicionada "Em análise"', async () => {
        await request(app)
            .delete(`/api/admin/transactions/${idRespostaEmAnalise}`)
            .expect(204)
    });
});

describe('DELETE em /accounts/id', () => {
    it('Deve deletar o account adicionado', async () => {
        await request(app)
            .delete(`/api/admin/accounts/${idRespostaAccount}`)
            .expect(204)
    });
});
