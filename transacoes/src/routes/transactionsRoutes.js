import express from 'express';
import TransactionController from '../controllers/TransactionsController.js';
import { bearer } from '../utils/middleware.js';

const router = express.Router();

router
  .get('/api/admin/transactions', TransactionController.findTransactions)
  .get('/api/admin/transactions/:id', TransactionController.findTransactionById)
  .post('/api/admin/transactions', bearer, TransactionController.createTransaction)
  .put('/api/admin/transactions/:id', TransactionController.updateTransactionStatus)
  .delete('/api/admin/transactions/:id', TransactionController.deleteTransaction);

export default router;
