/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcryptjs';
import generateToken from '../utils/auth.js';
import Account from '../models/Account.js';

class AccountController {
  static findAccounts = (_req, res) => {
    Account.find((err, allAccounts) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      return res.status(200).json(allAccounts);
    });
  };

  static findAccountById = (req, res) => {
    const { id } = req.params;
    Account.findById(id, (err, account) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      if (!account) {
        return res.status(404).json();
      }
      return res.status(200).json(account);
    });
  };

  static createAccount = async (req, res) => {
    const { nome, email, senha } = req.body;

    const conta = await Account.findOne({ email });
    if (conta) {
      return res.status(409).json({ message: 'Já existe uma conta com esse email' });
    }
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    const account = new Account({
      nome,
      email,
      senha: senhaHash,
      createdDate: Date(),
    });
    try {
      await account.save();
      return res.status(201).set('Location', `/admin/accounts/${account.id}`).json(account);
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  };

  static updateAccount = (req, res) => {
    const { id } = req.params;

    Account.findByIdAndUpdate(id, { $set: req.body }, { new: true }, (err, account) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      return res.status(204).set('Location', `/admin/accounts/${account.id}`).send();
    });
  };

  static deleteAccount = (req, res) => {
    const { id } = req.params;

    Account.findByIdAndDelete(id, (err) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      return res.status(204).send({ message: 'Account successfully deleted' });
    });
  };

  static newLogin = (req, res) => {
    const account = req.user;

    const token = generateToken(account._id);

    return res.status(204).header('Authorization', `Bearer ${token}`).send();
  };
}

export default AccountController;
