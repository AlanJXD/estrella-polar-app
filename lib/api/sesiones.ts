import { apiClient } from './client';

export interface CrearSesionData {
  fecha: string;
  horaInicial: string;
  horaFinal: string;
  nombreCliente: string;
  celularCliente?: string;
  paqueteId: number;
  especificaciones?: string;
  anticipo?: number;
  // restante se calcula automáticamente en el backend como: precio_paquete - anticipo
  comentario?: string;
  montoCaja?: number;
  editado?: number;
  entregado?: number;
}

export const sesionesApi = {
  listar: async (params?: { limit?: number; offset?: number }) => {
    const response = await apiClient.get('/sesiones', { params });
    return response.data;
  },

  proximas: async () => {
    const response = await apiClient.get('/sesiones/proximas');
    return response.data;
  },

  obtener: async (id: number) => {
    const response = await apiClient.get(`/sesiones/${id}`);
    return response.data;
  },

  crear: async (data: CrearSesionData) => {
    const response = await apiClient.post('/sesiones', data);
    return response.data;
  },

  actualizar: async (id: number, data: Partial<CrearSesionData>) => {
    const response = await apiClient.put(`/sesiones/${id}`, data);
    return response.data;
  },

  eliminar: async (id: number) => {
    const response = await apiClient.delete(`/sesiones/${id}`);
    return response.data;
  },

  agregarLiquidacion: async (
    id: number,
    data: { monto: number; cajaDestinoNombre: 'BBVA' | 'Efectivo' }
  ) => {
    const response = await apiClient.post(`/sesiones/${id}/liquidaciones`, data);
    return response.data;
  },

  agregarIngresoExtra: async (id: number, data: { concepto: string; monto: number }) => {
    const response = await apiClient.post(`/sesiones/${id}/ingresos-extra`, data);
    return response.data;
  },

  agregarGasto: async (id: number, data: { concepto: string; monto: number }) => {
    const response = await apiClient.post(`/sesiones/${id}/gastos`, data);
    return response.data;
  },

  actualizarDistribucion: async (
    id: number,
    data: { porcentajeItzel: number; porcentajeCristian: number; porcentajeCesar: number }
  ) => {
    const response = await apiClient.put(`/sesiones/${id}/distribucion`, data);
    return response.data;
  },

  reporteDistribucion: async (params?: { fechaInicio?: string; fechaFin?: string }) => {
    const response = await apiClient.get('/sesiones/reporte/distribucion', { params });
    return response.data;
  },
};
