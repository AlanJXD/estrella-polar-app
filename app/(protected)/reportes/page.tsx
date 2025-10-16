'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sesionesApi } from '@/lib/api/sesiones';
import { Calendar, DollarSign, Users, Wallet } from 'lucide-react';

interface DistribucionData {
  fechaInicio: string;
  fechaFin: string;
  totalIngresos: number;
  totalGastos: number;
  totalNeto: number;
  totalAnticipos: number;
  totalLiquidaciones: number;
  totalCajas: number;
  distribucion: {
    itzel: number;
    cristian: number;
    cesar: number;
  };
  sesiones?: any[];
}

export default function ReportesPage() {
  const [cargando, setCargando] = useState(false);
  const [reporte, setReporte] = useState<DistribucionData | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const obtenerMesActual = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const inicio = primerDia.toISOString().split('T')[0];
    const fin = ultimoDia.toISOString().split('T')[0];

    setFechaInicio(inicio);
    setFechaFin(fin);

    return { inicio, fin };
  };

  const cargarReporte = async (inicio?: string, fin?: string) => {
    setCargando(true);
    try {
      const response = await sesionesApi.reporteDistribucion({
        fechaInicio: inicio || fechaInicio,
        fechaFin: fin || fechaFin,
      });

      if (response.success) {
        setReporte(response.data);
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleMesActual = () => {
    const { inicio, fin } = obtenerMesActual();
    cargarReporte(inicio, fin);
  };

  const handleBuscar = () => {
    if (fechaInicio && fechaFin) {
      cargarReporte();
    }
  };

  useEffect(() => {
    handleMesActual();
  }, []);

  const formatearMoneda = (valor: string | number | undefined | null) => {
    if (valor === undefined || valor === null || valor === '') return '$0.00';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numero)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(numero);
  };

  const formatearFecha = (fecha: string | undefined | null) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = new Date(fecha + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Reportes</h1>
          <p className="text-white/60">Corte mensual y distribución de ingresos</p>
        </motion.div>

        {/* Selector de fechas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Seleccionar período</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMesActual}
              className="flex-1 min-w-[160px] py-3 px-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-lg font-medium transition-all"
            >
              Mes actual
            </button>
            <button
              onClick={handleBuscar}
              disabled={!fechaInicio || !fechaFin}
              className="flex-1 min-w-[160px] py-3 px-4 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          </div>
        </motion.div>

        {/* Reporte */}
        {cargando ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/10 rounded w-1/3"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : reporte ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Período */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Período del reporte</h3>
              <p className="text-white/80">
                {formatearFecha(fechaInicio)} - {formatearFecha(fechaFin)}
              </p>
              <p className="text-sm text-white/60 mt-2">
                Total de sesiones: {reporte.sesiones?.length || 0}
              </p>
            </div>

            {/* Resumen financiero */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Resumen financiero</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Ingresos totales</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatearMoneda(reporte.totalIngresos)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Gastos totales</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatearMoneda(reporte.totalGastos)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-white/60 mb-1">Ingresos netos</p>
                  <p className="text-2xl font-bold text-primary-400">
                    {formatearMoneda(reporte.totalNeto)}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribución */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-semibold text-white">Distribución de ingresos</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-400/30">
                  <p className="text-sm text-purple-200 mb-1">Itzel</p>
                  <p className="text-2xl font-bold text-white">
                    {formatearMoneda(reporte.distribucion.itzel)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-400/30">
                  <p className="text-sm text-blue-200 mb-1">Cristian</p>
                  <p className="text-2xl font-bold text-white">
                    {formatearMoneda(reporte.distribucion.cristian)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-400/30">
                  <p className="text-sm text-green-200 mb-1">César</p>
                  <p className="text-2xl font-bold text-white">
                    {formatearMoneda(reporte.distribucion.cesar)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-400/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-amber-200" />
                    <p className="text-sm text-amber-200">Caja de ahorro</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatearMoneda(reporte.totalCajas)}
                  </p>
                </div>
              </div>

              {/* Verificación de suma */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-white/60">Total distribuido</p>
                  <p className="text-lg font-semibold text-white">
                    {formatearMoneda(
                      (reporte.distribucion.itzel || 0) +
                      (reporte.distribucion.cristian || 0) +
                      (reporte.distribucion.cesar || 0) +
                      (reporte.totalCajas || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Selecciona un período para ver el reporte</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
