export interface Country {
  pais_iden: string;
  pais_desc: string;
  pais_stat: boolean;
  regi_iden: string;
}

export interface CountryResponse {
  statusCode: number;
  message: string;
  data: Country[];
  error: string;
}