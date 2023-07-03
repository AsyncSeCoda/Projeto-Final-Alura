import axios from 'axios';
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

        return res.status(resposeStatus).setHeader('Location', `/api/admin/transactions/${transaction.id}`).json({ status: newTransaction.status, id: transaction.id });
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

      const foundTransaction = await Transaction.findById(id).exec();

      if (foundTransaction.status !== 'Em análise') throw new Error('Apenas transações em análise podem ter o status alterado.');

      Transaction.updateOne({ _id: foundTransaction._id }, { $set: { status } }, { new: true }, (err) => {
        if (err) {
          return res.status(500).send({ errorMessage: err.message });
        }
        return res.status(204).set('Location', `/api/admin/transactions/${id}`).send();
      });
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
      console.log(error.response.data);
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

    Transaction.findByIdAndDelete(id, (err) => {
      if (err) {
        return res.status(500).send({ errorMessage: err.message });
      }
      return res.status(204).send({ message: 'Transação deletada com sucesso' });
    });
  };
}

export default TransactionController;
