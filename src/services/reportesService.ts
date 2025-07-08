/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getVolumenPorClientePeriodo = (params: any) =>
  axios.get(`${API_URL}/reportes/volumen-por-cliente`, { params });

export const getDistribucionGeografica = (params: any) =>
  axios.get(`${API_URL}/reportes/distribucion-geografica`, { params });

export const getValorPorTipoMercaderia = (params: any) =>
  axios.get(`${API_URL}/reportes/valor-por-tipo-mercaderia`, { params }); 