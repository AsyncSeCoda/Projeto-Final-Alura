import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    valor: { type: Number, required: true },
    status: { type: String, required: true },
    idCliente: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  },
);

const Transaction = mongoose.model('transactions', transactionSchema);

export default Transaction;
