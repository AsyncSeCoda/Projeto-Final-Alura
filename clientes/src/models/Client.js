import mongoose from 'mongoose';

const dadosPessoaisSchema = new mongoose.Schema(
  {
    _id: { type: String, auto: false },
    nome: { type: String },
    cpf: { type: String },
    email: { type: String },
    telefone: { type: String },
    rendaMensal: { type: Number },
  },
  {
    versionKey: false,
  },
);

const enderoSchema = new mongoose.Schema(
  {
    _id: { type: String, auto: false },
    rua: { type: String },
    numero: { type: String || Number },
    complemento: { type: String || Number },
    cep: { type: String },
    cidade: { type: String },
    uf: { type: String },
  },
  {
    versionKey: false,
  },
);

const cartaoSchema = new mongoose.Schema(
  {
    _id: { type: String, auto: false },
    numeroCartao: { type: String },
    nomeCartao: { type: String },
    validadeCartao: { type: String },
    cvcCartao: { type: String },
    vencimentoFatura: { type: String },
  },
  {
    versionKey: false,
  },
);

const clientSchema = new mongoose.Schema(
  {
    dadosPessoais: { type: dadosPessoaisSchema, required: true },
    endereco: { type: enderoSchema, required: true },
    cartao: { type: cartaoSchema, required: true },
  },
  {
    versionKey: false,
  },
);

const Client = mongoose.model('clients', clientSchema);

export default Client;
