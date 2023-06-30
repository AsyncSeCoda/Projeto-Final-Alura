import AntiFraud from '../models/AntiFraude.js';
import axios from 'axios';

function determinaStatus(statusAntigo, statusUpdate) {
  const valorStatus = 'Aprovada' || 'Reprovada';
  if (statusAntigo === 'Em Análise') {
    return valorStatus;
  }
  //else if (statusAntigo === valorStatus) {
//     return { status: valorStatus }; 
//   }
  return statusUpdate;
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
      const responseClient = await axios.get(`http://127.0.0.1:3006/api/admin/clients/${response.idCliente}`);
      const responseTransaction = await axios.get(`http://127.0.0.1:3005/api/admin/transactions/${response.idTransacao}`);
      const valor = responseTransaction.data.valor;
      res.status(200).json({...responseClient.data, ...response._doc, valor});
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
      const response = await AntiFraud.findById(id).exec();

      //response é o documento não atualizado
      //a função determina Status pega o valor antigo de status e faz uma verificação 
      const valorUpdate = determinaStatus(response.status, req.body.status);
      console.log(valorUpdate);

      AntiFraud.findByIdAndUpdate(id, { status: valorUpdate });

      //const responseTransaction = await fetch('http://localhost:3001/api/admin/transcation/:id');

    // if (response.status === 404) throw new Error(await response.text());

    // const responseBody = await response.json();

    // if (response.status === 400) throw new Error(responseBody.errorMessage);

    // return responseBody;
    res.status(200).send('Caso não encontrado');

    } catch (err) {
      res.status(404).send('Caso não encontrado');
    }
  };
}

export default antiFraudController;
