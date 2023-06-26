import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const accountSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    senha: { type: String, required: true },
  },
);

accountSchema.pre('save', async (next) => {
  if (this.isModified('senha')) {
    try {
      const salt = await bcrypt.genSalt(12);
      const senhaHash = await bcrypt.hash(this.senha, salt);
      this.senha = senhaHash;
      return next();
    } catch (err) {
      return next(err);
    }
  }
  return next();
});

const Account = mongoose.model('accounts', accountSchema);

export default Account;
