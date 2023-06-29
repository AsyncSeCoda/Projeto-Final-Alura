import express from 'express';
import TransactionController from '../controllers/TransactionsController.js';
import { bearer } from '../utils/middleware.js';

const router = express.Router();

router
  .get('/api/admin/transactions', TransactionController.findTransactions)
  .post('/api/admin/transactions', TransactionController.createTransaction);

export default router;
