import express from 'express';
import AntiFraudController from '../controllers/AntiFraudController.js';

const router = express.Router();

router
  .get('/api/admin/antiFraud/:id', AntiFraudController.findAntiFraudById)
  .get('/api/admin/antiFraud', AntiFraudController.findAntiFraudInAnalysis)
  .post('/api/admin/antiFraud', AntiFraudController.createAntiFraud)
  .put('/api/admin/antiFraud/:id', AntiFraudController.updateAntiFraud);

export default router;