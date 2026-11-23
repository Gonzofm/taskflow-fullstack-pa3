import type { RequestHandler } from 'express';
import type { Pool } from 'mysql2/promise';
import { createCatalogModel } from '../models/catalogModel.js';
import { AppError } from '../middlewares/errors.js';

export function createCatalogController(database: Pool, publicUrl: string): Record<'integrantes' | 'categorias' | 'plantillas' | 'porCategoria' | 'detalle', RequestHandler> {
  const model = createCatalogModel(database);
  const withImage = <T extends { imagen: string }>(row: T): T => ({ ...row, imagen: new URL(row.imagen, publicUrl).href });
  return {
    integrantes: async (_req, res) => res.json({ success: true, data: { integrantes: (await model.integrantes()).map(withImage) } }),
    categorias: async (_req, res) => res.json({ success: true, data: { categorias: (await model.categorias()).map(withImage) } }),
    plantillas: async (_req, res) => res.json({ success: true, data: { plantillas: (await model.plantillas()).map(withImage) } }),
    porCategoria: async (req, res) => {
      const id = Number(req.params.id);
      if (!await model.categoriaExists(id)) throw new AppError(404, 'No se encontró la categoría.');
      res.json({ success: true, data: { plantillas: (await model.plantillas(id)).map(withImage) } });
    },
    detalle: async (req, res) => {
      const plantilla = await model.plantilla(Number(req.params.id));
      if (!plantilla) throw new AppError(404, 'No se encontró la plantilla.');
      res.json({ success: true, data: { plantilla: withImage(plantilla) } });
    },
  };
}
