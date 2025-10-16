import { apiClient } from './client';

export interface Caja {
  id: number;
  saldoActual: string;
  tipoCaja: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface MovimientoCaja {
  id: number;
  concepto: string;
  monto: string;
  saldoAnterior: string;
  saldoNuevo: string;
  fechaRegistro: string;
  tipoMovimiento: {
    nombre: string;
  };
  usuario: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
  };
  sesion?: {
    id: number;
    nombreCliente: string;
  };
}

export interface CrearMovimientoData {
  cajaNombre: 'Caja' | 'BBVA' | 'Efectivo';
  tipoMovimiento: 'Ingreso' | 'Retiro';
  concepto: string;
  monto: number;
}

export const cajasApi = {
  listar: async () => {
    const response = await apiClient.get('/cajas');
    return response.data;
  },

  obtenerMovimientos: async (
    id: number,
    params?: { limit?: number; offset?: number }
  ) => {
    const response = await apiClient.get(`/cajas/${id}/movimientos`, { params });
    return response.data;
  },

  crearMovimiento: async (data: CrearMovimientoData) => {
    const response = await apiClient.post('/cajas/movimiento', data);
    return response.data;
  },
};
