import axios from 'axios';
import amqp from 'amqplib';
import Transaction from '../models/Transaction.js';


let connection;
let channel;

async function connectRabbitMQ() {
  connection = await amqp.connect(`amqp://${process.env.RABBIT_CONTAINER || 'localhost'}`);
  channel = await connection.createChannel();

  return { connection, channel };
}

async function useRabbitMQ(connect, canal) {
  try {
    await canal.assertQueue('antiFraudRequest', { durable: true });
    await canal.consume(
      'antiFraudRequest',
      async (message) => {
        if (message) {
          const messageContent = JSON.parse(message.content.toString());
          console.log(messageContent);
          console.log(
            " [x] Received '%s'",
            JSON.parse(message.content.toString()),
          );
          await Transaction.findByIdAndUpdate(messageContent._id, { status: messageContent.status });
        }
      },
      { noAck: true },
    );
    console.log(' [*] Waiting for messages. To exit press CTRL+C');

    await channel.close();
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
}

({ connection, channel } = await connectRabbitMQ());

await useRabbitMQ(connection, channel);

function generateFullURL(req, porta) {
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const port = process.env.PORT || porta;

  return `${protocol}://${host}:${port}${url}`;
}

function generateHATEOASLink(REF, HTTP, LINK, ID = '') {
  return {
    rel: REF,
    method: HTTP,
    href: LINK + ID,
  };
}

class TransactionController {
  static findTransactions = (_req, res) => {
    const hateOasLinks = generateHATEOASLink('retorna todas as transações', 'GET', generateFullURL(_req, 3002));
    Transaction.find((err, allTransactions) => {
      if (err) {
        return res.status(500).send({ errorMessage: err.message });
      }

      const response = allTransactions;
      response.push({ link: hateOasLinks });
      return res.status(200).json(response);
    });
  };

  static findTransactionById = (req, res) => {
    const { id } = req.params;
    Transaction.findById(id, (err, transaction) => {
      if (err) {
        return res.status(500).send({ errorMessage: err.message });
      }
      if (!transaction) {
        return res.status(404).json();
      }

      const link = generateHATEOASLink('retorna transação específica através do id', 'GET', generateFullURL(req, 3002, id));
      return res.status(200).json({ ...transaction._doc, link });
    });
  };

  static createTransaction = async (req, res) => {
    try {
      const {
        valor, nomeCartao, numeroCartao, validadeCartao, cvcCartao, vencimentoFatura,
      } = req.body;

      const clientData = await this.getClientDataByCard(nomeCartao, numeroCartao, validadeCartao, cvcCartao, vencimentoFatura);
      const { idCliente, rendaMensal } = clientData;

      const isTransactionInAnalysis = valor < (rendaMensal / 2);

      const transactionStatus = isTransactionInAnalysis ? 'Aprovada' : 'Em análise';

      const transaction = new Transaction({
        valor,
        status: transactionStatus,
        idCliente,
      });

      transaction.save(async (err, newTransaction) => {
        if (err) {
          return res.status(500).send({ errorMessage: err.message });
        }


        if (!isTransactionInAnalysis) {
          (async () => {
            try {
              ({ connection, channel } = await connectRabbitMQ());

              await channel.assertQueue('transactions-request');
              channel.sendToQueue('transactions-request', Buffer.from(JSON.stringify(transaction)));
              console.log(" [x] Sent '%s'", transaction);

              await channel.close();
            } catch (erroRabbit) {
              console.warn(erroRabbit);
            } finally {
              if (connection) await connection.close();
            }
          })();
        }

        const resposeStatus = isTransactionInAnalysis ? 201 : 303;
        const link = generateHATEOASLink('cria transação', 'POST', generateFullURL(req, 3002, transaction.id));
        res.status(resposeStatus).json({...newTransaction._doc, link});
      });
    } catch (error) {
      res.status(400).send({ errorMessage: error.message });
    }
  };

  static updateTransactionStatus = async (req, res) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if ((status !== 'Aprovada') && (status !== 'Rejeitada')) throw new Error('Status inválido.');

      const foundTransaction = await Transaction.findById(id);

      if (foundTransaction.status !== 'Em análise') throw new Error('Apenas transações em análise podem ter o status alterado.');

      // Transaction.updateOne({ _id: foundTransaction._id }, { $set: { status } }, { new: true }, (err) => {
      //   const link = generateHATEOASLink('atualiza transação', 'PUT', generateFullURL(req, 3002, foundTransaction._id));
      //   if (err) {
      //     return res.status(500).send({ errorMessage: err.message });
      //   }
      //   return res.status(200).set('Location', `/api/admin/transactions/${id}`).send(link);
      // });
    } catch (error) {
      res.status(404).send({ errorMessage: error.message });
    }
  };

  static getClientDataByCard = async (clientName, cardNumber, expirationDate, cardCvc, invoiceDueDate) => {
    try {
      const response = await axios.get(`http://${process.env.CLIENTES_CONTAINER || 'localhost'}:3001/api/admin/clients/card`, {
        params: {
          nomeCartao: clientName,
          numeroCartao: cardNumber,
          validadeCartao: expirationDate,
          cvcCartao: cardCvc,
          vencimentoFatura: invoiceDueDate,
        },
      });

      return response.data;
    } catch (error) {
      if (error.response.status === 404) throw new Error(error.response.data);

      throw new Error(error.response.data.errorMessage);
    }
  };

  static createAntiFraud = async (clientId, transactionId, status) => {
    try {
      const response = await axios.post(`http://${process.env.ANTIFRAUDE_CONTAINER || 'localhost'}:3000/api/admin/antiFraud`, {
        idCliente: clientId,
        idTransacao: transactionId,
        status,
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.errorMessage);
    }
  };

  static deleteTransaction = (req, res) => {
    const { id } = req.params;

    const link = generateHATEOASLink('deleta transação', 'DELETE', generateFullURL(req, 3002, id));
    Transaction.findByIdAndDelete(id, (err) => {
      if (err) {
        return res.status(500).send({ errorMessage: err.message });
      }
      return res.status(200).send({ message: 'Transação deletada com sucesso', link});
    });
  };
}

export default TransactionController;
