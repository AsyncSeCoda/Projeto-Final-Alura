import fetch from 'node-fetch';
import Transaction from '../models/Transaction.js';

class TransactionController {
  static findTransactions = (_req, res) => {
    Transaction.find((err, allTransactions) => {
      if (err) {
        return res.status(500).send({ errorMessage: err.message });
      }
      return res.status(200).json(allTransactions);
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
      return res.status(200).json(transaction);
    });
  };

  static async getClientDataByCard(clientName, cardNumber, expirationDate, cardCvc, invoiceDueDate) {
    const response = await fetch(`http://${process.env.CLIENTES_CONTAINER || 'localhost'}:3001/api/admin/clients/card?${new URLSearchParams({
      nomeCartao: clientName,
      numeroCartao: cardNumber,
      validadeCartao: expirationDate,
      cvcCartao: cardCvc,
      vencimentoFatura: invoiceDueDate,
    })}`);

    if (response.status === 404) throw new Error(await response.text());

    const responseBody = await response.json();

    if (response.status === 400) throw new Error(responseBody.errorMessage);

    return responseBody;
  }

  static async createAntiFraud(clientId, transactionId, status) {
    const response = await fetch(`http://${process.env.ANTIFRAUDE_CONTAINER || 'localhost'}:3000/api/admin/antiFraud`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idCliente: clientId,
        idTransacao: transactionId,
        status,
      }),
    });

    const responseBody = await response.json();

    if (!response.ok) throw new Error(responseBody.errorMessage);

    return responseBody;
  }

  static createTransaction = async (req, res) => {
    try {
      const {
        valor, nomeCartao, numeroCartao, validadeCartao, cvcCartao, vencimentoFatura,
      } = req.body;

      const clientData = await this.getClientDataByCard(nomeCartao, numeroCartao, validadeCartao, cvcCartao, vencimentoFatura);
      const { idCliente, rendaMensal } = clientData;

      const isTheTransactionValid = valor < (rendaMensal / 2);

      const transactionStatus = isTheTransactionValid ? 'Aprovada' : 'Em análise';

      const transaction = new Transaction({
        valor,
        status: transactionStatus,
        idCliente,
      });

      transaction.save(async (err, newTransaction) => {
        if (err) {
          return res.status(500).send({ errorMessage: err.message });
        }

        if (!isTheTransactionValid) await this.createAntiFraud(idCliente, transaction.id, transactionStatus);

        const resposeStatus = isTheTransactionValid ? 201 : 303;

        return res.status(resposeStatus).setHeader('Location', `http://localhost:3002/api/admin/transactions/${transaction.id}`).json({ status: newTransaction.status, id: transaction.id });
      });
    } catch (error) {
      res.status(400).send({ errorMessage: error.message });
    }
  };
}

export default TransactionController;
