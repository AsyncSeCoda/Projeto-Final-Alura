/* eslint-disable linebreak-style */
import express from 'express';
import AccountController from '../controllers/AccountsController.js';
import { local } from '../utils/middleware.js';

const router = express.Router();

router
  .get('/api/admin/accounts', AccountController.findAccounts)
  .get('/api/admin/accounts/:id', AccountController.findAccountById)
  .post('/api/admin/accounts', AccountController.createAccount)
  .put('/api/admin/accounts/:id', AccountController.updateAccount)
  .delete('/api/admin/accounts/:id', AccountController.deleteAccount)
  .post('/api/accounts/login', local, AccountController.newLogin);

export default router;
