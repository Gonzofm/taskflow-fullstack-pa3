export interface Integrante {
  id: number;
  nombre: string;
  cargo: string;
  descripcion: string;
  imagen: string;
  especialidad: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  total_plantillas: number;
}

export interface Plantilla {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  dificultad: string;
  estado: string;
  categoria_nombre: string;
}
