import axios from 'axios';
import AntiFraud from '../models/AntiFraude.js';
import axios from 'axios';

function determinaStatus(statusAntigo, statusUpdate) {
  const valorStatus = ['Aprovada', 'Rejeitada'];
  console.log(valorStatus);
  console.log(valorStatus.includes('Rejeitada'));
  if (statusAntigo === 'Em análise') {
    if (!valorStatus.includes(statusUpdate)) {
      throw new Error('O novo status só pode ser atualizado para Aprovada ou Reprovada.');
    }
    return statusUpdate;
  }

  throw new Error('Apenas status em análise pode ser alterado.');
}

class antiFraudController {
  static findAntiFraudInAnalysis = async (req, res) => {
    try {
      const response = await AntiFraud.find({ status: 'Em análise' }).exec();
      res.status(200).json(response);
    } catch (err) {
      res.status(404).send('Nenhum caso encontrado');
    }
  };


  static findAntiFraudById = async (req, res) => {
    const { id } = req.params;
    try {
      const response = await AntiFraud.findById(id);
      const responseClient = await axios.get(`http://127.0.0.1:3001/api/admin/clients/${response.idCliente}`);
      const responseTransaction = await axios.get(`http://127.0.0.1:3002/api/admin/transactions/${response.idTransacao}`);
      const valor = responseTransaction.data.valor;
      res.status(200).json({ ...responseClient.data, ...response._doc, valor });
    } catch (err) {
      res.status(404).send('Nenhum caso encontrado');
    }
  };

  static createAntiFraud = async (req, res) => {
    try {
      const antiFraud = new AntiFraud(req.body);
      await antiFraud.save();
      res.status(201).json(antiFraud);
    } catch (err) {
      res.status(400).send({ errorMessage: err.message });
    }
  };

  static updateAntiFraud = async (req, res) => {
    const { id } = req.params;
    try {
      const response = await AntiFraud.findById(id);

      const valorUpdate = determinaStatus(response.status, req.body.status);

      await AntiFraud.findByIdAndUpdate(id, { status: valorUpdate });

      await axios.put(`http://localhost:3002/api/admin/transactions/${response.idTransacao}`, {
        status: valorUpdate,
      });

      if (response.status === 404) throw new Error('Transação não encontrada');

      res.status(200).send('Caso atualizado e retorna às transações');
    } catch (err) {
      res.status(404).send(err.message);
    }
  };
}

export default antiFraudController;
