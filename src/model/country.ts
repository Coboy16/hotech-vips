export interface Country {
  pais_iden: string; // UUID
  pais_desc: string; // Nombre del país
  pais_codi: string; // Código (ej: DO)
  pais_stat?: boolean; // Estado (opcional)
  // Puedes añadir más campos si la API los devuelve
}
