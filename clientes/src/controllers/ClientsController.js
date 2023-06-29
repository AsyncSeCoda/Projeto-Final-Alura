import Client from '../models/Client.js';
import { validaClient, validaCartao } from '../utils/validation.js';

class ClientController {
  static findClients = async (req, res) => {
    const response = await Client.find();
    if (response.length > 0) {
      res.status(200).json(response);
    } else {
      res.status(404).send('Nenhum cliente encontrado');
    }
  };

  static findClientById = async (req, res) => {
    const { id } = req.params;
    try {
      const { dadosPessoais, endereco } = await Client.findById({ _id: id });
      res.status(200).json({ dadosPessoais, endereco });
    } catch {
      res.status(404).send('Nenhum cliente encontrado');
    }
  };

  static findClientByCard = async (req, res) => {
    try {
      const { numeroCartao, nomeCartao, cvcCartao } = req.query;
      validaCartao(req.query);

      const cliente = await Client.findOne({
        'cartao.numeroCartao': numeroCartao,
        'cartao.nomeCartao': nomeCartao,
        'cartao.cvcCartao': cvcCartao,
      });

      if (cliente) {
        const { _id: id } = cliente;
        return res.status(200).json({
          idCliente: id,
          rendaMensal: cliente.dadosPessoais.rendaMensal,
        });
      }

      return res.status(404).send('Nenhum cliente encontrado com os dados disponibilizados');
    } catch (err) {
      return res.status(400).send({ errorMessage: err.message });
    }
  };

  static createClient = async (req, res) => {
    try {
      validaClient(req.body);
      const cliente = new Client(req.body);
      await cliente.save();
      res.status(201).json(cliente);
    } catch (err) {
      res.status(400).send({ errorMessage: err.message });
    }
  };

  static updateClient = async (req, res) => {
    const { id } = req.params;
    try {
      validaClient(req.body);
      try {
        await Client.findByIdAndUpdate({ _id: id }, req.body);
        res.status(200).send('Cliente atualizado');
      } catch {
        res.status(404).send('Cliente não encontrado');
      }
    } catch (err) {
      res.status(400).send({ errorMessage: err.message });
    }
  };

  static deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
      await Client.findByIdAndDelete({ _id: id });
      res.status(200).send('Cliente removido');
    } catch {
      res.status(404).send('Cliente não encontrado');
    }
  };
}

export default ClientController;
