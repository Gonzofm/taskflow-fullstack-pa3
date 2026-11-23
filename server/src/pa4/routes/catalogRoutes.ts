import { Router } from 'express';
import type { Pool } from 'mysql2/promise';
import { createCatalogController } from '../controllers/catalogController.js';
import { validateNumericId } from '../middlewares/validateId.js';

export function catalogRoutes(database: Pool, publicUrl: string): Router {
  const router = Router();
  const controller = createCatalogController(database, publicUrl);
  router.get('/integrantes', controller.integrantes);
  router.get('/categorias', controller.categorias);
  router.get('/plantillas', controller.plantillas);
  router.get('/plantillas/categoria/:id', validateNumericId, controller.porCategoria);
  router.get('/plantillas/:id', validateNumericId, controller.detalle);
  return router;
}
