import Transaction from '../models/Transaction.js';

class TransactionController {
  static findTransactions = (_req, res) => {
    Transaction.find((err, allTransactions) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      return res.status(200).json(allTransactions);
    });
  };

  static async getClientDataByCard(clientName, cardNumber, expirationDate, cardCvc, invoiceDueDate) {
    const response = await fetch('http://localhost:3001/api/admin/clients/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomeCartao: clientName,
        numeroCartao: cardNumber,
        validadeCartao: expirationDate,
        cvcCartao: cardCvc,
        vencimentoFatura: invoiceDueDate,
      }),
    });
    // Quando for implementar por params:
    // const response = await fetch(`http://localhost:3001/api/admin/clients/card?${new URLSearchParams({
    //   nomeCartao: clientName,
    //   numeroCartao: cardNumber,
    //   validadeCartao: expirationDate,
    //   cvcCartao: cardCvc,
    //   vencimentoFatura: invoiceDueDate,
    // })}`);

    const responseBody = await response.json();

    console.log(responseBody)

    // if (response.status === 400) throw new Error(responseBody.errorMessage);

    // if (response.status === 404) throw new Error({ errorMessage: responseBody });

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

      if (!isTheTransactionValid) {
        console.log('Transacao em analise, chaamar antifraude');
        // Chamar API antifraude
      }

      const transactionStatus = isTheTransactionValid ? 'Aprovada' : 'Em análise';

      const transaction = new Transaction({
        valor,
        status: transactionStatus,
        idCliente,
      });

      transaction.save((err, newTransaction) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }

        const resposeStatus = isTheTransactionValid ? 201 : 303;

        return res.status(resposeStatus).set('Location', `/admin/transactions/${transaction.id}`).json({ status: newTransaction.status, id: newTransaction._id });
      });
    } catch (error) {
      // res.status(400).send({ erro: 'Dados inválidos' });
      res.status(400).send({ erro: error.message });
    }
  };
}

export default TransactionController;
