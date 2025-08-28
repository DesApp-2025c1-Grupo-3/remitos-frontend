/// <reference types="vite/client" />
import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

export const getVolumenPorClientePeriodo = (params: any) =>
  axios.get(`${API_URL}/api/reportes/volumen-por-cliente`, { params });

export const getDistribucionGeografica = (params: any) =>
  axios.get(`${API_URL}/api/reportes/distribucion-geografica`, { params });

export const getValorPorTipoMercaderia = (params: any) =>
  axios.get(`${API_URL}/api/reportes/valor-por-tipo-mercaderia`, { params }); 