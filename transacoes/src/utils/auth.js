import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Account from '../models/Account.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

async function buscaPorId(id) {
  const usuario = Account.findById(id);
  if (!usuario) {
    throw new Error('Id inválido');
  }

  return new Account(usuario);
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'senha',
      session: 'false',
    },
    async (email, senha, done) => {
      try {
        const account = await Account.findOne({ email });

        if (!account) {
          throw new Error('Email não encontrado');
        }

        const isMatch = await bcrypt.compare(senha, account.senha);

        if (!isMatch) {
          throw new Error('Senha inválida');
        }

        return done(null, account);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new BearerStrategy(
    async (token, done) => {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const account = await buscaPorId(payload.id);

        done(null, account);
      } catch (err) {
        done(err);
      }
    },
  ),
);

const generateToken = (id) => {
  const payload = { id };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  return token;
};

export default generateToken;
