import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const antiFraudeSchema = new mongoose.Schema(
  {
    _id: { type: ObjectId },
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
      default: 'Em análise',
      immutable: (doc) => {
        if (doc.status === 'Aprovada' || 'Rejeitada') {
          return true;
        }
        return false;
      },
    },
  },
);

const antiFraude = mongoose.model('antiFraud', antiFraudeSchema);

export default antiFraude;
