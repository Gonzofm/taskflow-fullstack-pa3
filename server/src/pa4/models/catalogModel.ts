import type { Pool, RowDataPacket } from 'mysql2/promise';

export interface Integrante extends RowDataPacket {
  id: number; nombre: string; cargo: string; descripcion: string; imagen: string; especialidad: string;
}
export interface Categoria extends RowDataPacket {
  id: number; nombre: string; descripcion: string; imagen: string; total_plantillas: number;
}
export interface Plantilla extends RowDataPacket {
  id: number; categoria_id: number; nombre: string; descripcion: string;
  imagen: string; dificultad: string; estado: string; categoria_nombre: string;
}

export function createCatalogModel(database: Pool) {
  const plantillaSelect = 'SELECT p.id,p.categoria_id,p.nombre,p.descripcion,p.imagen,p.dificultad,p.estado,c.nombre AS categoria_nombre FROM plantillas p INNER JOIN categorias c ON c.id=p.categoria_id';
  return {
    async integrantes(): Promise<Integrante[]> {
      const [rows] = await database.execute<Integrante[]>('SELECT id,nombre,cargo,descripcion,imagen,especialidad FROM integrantes ORDER BY id');
      return rows;
    },
    async categorias(): Promise<Categoria[]> {
      const [rows] = await database.execute<Categoria[]>('SELECT c.id,c.nombre,c.descripcion,c.imagen,COUNT(p.id) AS total_plantillas FROM categorias c LEFT JOIN plantillas p ON p.categoria_id=c.id GROUP BY c.id,c.nombre,c.descripcion,c.imagen ORDER BY c.id');
      return rows.map((row) => ({ ...row, total_plantillas: Number(row.total_plantillas) }));
    },
    async categoriaExists(id: number): Promise<boolean> {
      const [rows] = await database.execute<RowDataPacket[]>('SELECT id FROM categorias WHERE id=?', [id]);
      return rows.length > 0;
    },
    async plantillas(categoriaId?: number): Promise<Plantilla[]> {
      const [rows] = categoriaId === undefined
        ? await database.execute<Plantilla[]>(`${plantillaSelect} ORDER BY p.id`)
        : await database.execute<Plantilla[]>(`${plantillaSelect} WHERE p.categoria_id=? ORDER BY p.id`, [categoriaId]);
      return rows;
    },
    async plantilla(id: number): Promise<Plantilla | null> {
      const [rows] = await database.execute<Plantilla[]>(`${plantillaSelect} WHERE p.id=?`, [id]);
      return rows[0] ?? null;
    },
  };
}
