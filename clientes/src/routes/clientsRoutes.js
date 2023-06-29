import express from 'express';
import ClientController from '../controllers/ClientsController.js';
import { bearer } from '../utils/middleware.js';

const router = express.Router();

router
  .get('/api/admin/clients', ClientController.findClients)
  .post('/api/admin/clients/card', ClientController.findClientByCard)
  .get('/api/admin/clients/:id', ClientController.findClientById)
  .post('/api/admin/clients', bearer, ClientController.createClient)
  .put('/api/admin/clients/:id', ClientController.updateClient)
  .delete('/api/admin/clients/:id', ClientController.deleteClient);

export default router;
