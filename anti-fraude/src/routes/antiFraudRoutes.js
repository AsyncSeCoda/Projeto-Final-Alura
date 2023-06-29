import express from 'express';
import AntiFraudController from '../controllers/AntiFraudController.js';

const router = express.Router();

router
  .get('/api/admin/antiFraud', AntiFraudController.findAntiFraudInAnalysis)
  .get('/api/admin/antiFraud/:id', AntiFraudController.findAntiFraudById)
  .post('/api/admin/antiFraud', AntiFraudController.createAntiFraud)
  .patch('/api/admin/antiFraud/:id', AntiFraudController.updateAntiFraud);

export default router;
