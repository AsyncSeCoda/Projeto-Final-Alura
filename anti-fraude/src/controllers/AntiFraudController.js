import AntiFraud from '../models/AntiFraude.js';

function determinaValorAnalise(status) {
  if (status === 'Em Análise') {
    const valorStatus = 'Aprovada' || 'Reprovada';
    return { status: valorStatus };
  }
  return { status };
}

class antiFraudController {
  static findAntiFraudInAnalysis = async (req, res) => {
    try {
      const response = await AntiFraud.findOne({ status: 'Em análise' }).exec();
      res.status(200).json(response);
    } catch {
      res.status(404).send('Nenhum caso encontrado');
    }
  };

  static findAntiFraudById = async (req, res) => {
    const { id } = req.params;
    try {
      const response = await AntiFraud.findById({ _id: id }).populate('idCliente').populate('idTransicao').exec();
      res.status(200).json(response);
    } catch {
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
      await AntiFraud.findByIdAndUpdate({ _id: id }, determinaValorAnalise(req.body.status));
      res.status(200).send('Caso atualizado');
    } catch {
      res.status(404).send('Caso não encontrado');
    }
  };
}

export default antiFraudController;
