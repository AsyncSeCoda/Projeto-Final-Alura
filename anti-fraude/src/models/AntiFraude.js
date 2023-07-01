import mongoose from 'mongoose';

const antiFraudeSchema = new mongoose.Schema(
  {
    idCliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'clients',
      required: true,
    },
    idTransacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transactions',
      required: true,
    },
    status: {
      type: String,
      enum: ['Em análise', 'Aprovada'],
    },
  },
  {
    versionKey: false,
  },
);

const antiFraude = mongoose.model('antifrauds', antiFraudeSchema);

export default antiFraude;
