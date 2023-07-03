import axios from 'axios';
import AntiFraud from '../models/AntiFraude.js';

function determinaStatus(statusAntigo, statusUpdate) {
  const valorStatus = ['Aprovada', 'Rejeitada'];
  if (statusAntigo === 'Em análise') {
    if (!valorStatus.includes(statusUpdate)) {
      throw new Error('O novo status só pode ser atualizado para Aprovada ou Reprovada.');
    }
    return statusUpdate;
  }

  throw new Error('Apenas status em análise pode ser alterado.');
}

function generateFullURL(req,porta) {
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const port = process.env.PORT || porta;

  return `${protocol}://${host}:${port}${url}`;
}

function generateHATEOASLink(REF, HTTP, LINK,ID='') {
  return {
    rel: REF,
    method: HTTP,
    href: LINK + ID,
  };
}

class antiFraudController {
  static findAntiFraudInAnalysis = async (req, res) => {
    try {
      const response = await AntiFraud.find({ status: 'Em análise' });
      const hateOasLinks = generateHATEOASLink('retorna toda a anti-fraude em análise', 'GET', generateFullURL(req, 3000));
      response.push({link: hateOasLinks});
      res.json(response);
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
      const link = generateHATEOASLink('retorna anti-fraude específica através do id', 'GET', generateFullURL(req, 3000, id));
      const valor = responseTransaction.data.valor;

      res.status(200).json({ ...responseClient.data, ...response._doc, valor, link });
    } catch (err) {
      res.status(404).send('Nenhum caso encontrado');
    }
  };

  static createAntiFraud = async (req, res) => {
    try {
      const antiFraud = new AntiFraud(req.body);
      await antiFraud.save();
      const link = generateHATEOASLink('cria anti-fraude', 'GET', generateFullURL(req, 3000));
      res.status(201).json({...antiFraud._doc, link});
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

      const atualizaTransac = await axios.put(`http://localhost:3002/api/admin/transactions/${response.idTransacao}`, {
        status: valorUpdate,
      });

      const link = generateHATEOASLink('atualizada status de anti-fraude específica através do id', 'GET', generateFullURL(req, 3000, id));

      if (atualizaTransac.status === 204) {
        res.status(200).json({status: valorUpdate, link });
      }
    } catch (err) {
      res.status(404).send(err.message);
    }
  };
}

export default antiFraudController;
