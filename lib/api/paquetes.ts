import { apiClient } from './client';

export interface Paquete {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string;
  porcentajeCesar?: string;
  porcentajeCristian?: string;
  porcentajeItzel?: string;
  activo?: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

export const paquetesApi = {
  listar: async () => {
    const response = await apiClient.get('/paquetes');
    return response.data;
  },

  obtener: async (id: number) => {
    const response = await apiClient.get(`/paquetes/${id}`);
    return response.data;
  },

  crear: async (data: {
    nombre: string;
    descripcion?: string;
    precio: number;
    porcentajeCesar?: number;
    porcentajeCristian?: number;
    porcentajeItzel?: number;
  }) => {
    const response = await apiClient.post('/paquetes', data);
    return response.data;
  },

  actualizar: async (id: number, data: {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    porcentajeCesar?: number;
    porcentajeCristian?: number;
    porcentajeItzel?: number;
    activo?: number;
  }) => {
    const response = await apiClient.put(`/paquetes/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number) => {
    const response = await apiClient.delete(`/paquetes/${id}`);
    return response.data;
  },
};
