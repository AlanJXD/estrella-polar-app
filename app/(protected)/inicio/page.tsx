'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { sesionesApi } from '@/lib/api/sesiones';
import { cajasApi, Caja } from '@/lib/api/cajas';

export default function InicioPage() {
  const { usuario } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    ingresosMes: 0,
    gastosMes: 0,
    balance: 0,
    sesionesMes: 0,
  });
  const [cajas, setCajas] = useState<Caja[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener fechas del mes actual
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

      const fechaInicio = primerDia.toISOString().split('T')[0];
      const fechaFin = ultimoDia.toISOString().split('T')[0];

      // Cargar reporte de distribución del mes actual
      const [responseReporte, responseCajas] = await Promise.all([
        sesionesApi.reporteDistribucion({ fechaInicio, fechaFin }),
        cajasApi.listar(),
      ]);

      if (responseReporte.success) {
        const { totalIngresos, totalGastos, totalNeto } = responseReporte.data;
        setEstadisticas({
          ingresosMes: Number(totalIngresos) || 0,
          gastosMes: Number(totalGastos) || 0,
          balance: Number(totalNeto) || 0,
          sesionesMes: responseReporte.data.sesiones?.length || 0,
        });
      }

      if (responseCajas.success) {
        setCajas(responseCajas.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMesActual = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[new Date().getMonth()];
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Bienvenido, {usuario?.nombre}
        </h1>
        <p className="text-slate-300 text-sm">
          Resumen del mes de {getMesActual()}
        </p>
      </motion.div>

      {/* Estadísticas del Mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Ingresos del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Ingresos</h2>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="h-10 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-3xl font-bold text-green-400">
                ${estadisticas.ingresosMes.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400 mt-2">{getMesActual()}</p>
            </>
          )}
        </motion.div>

        {/* Gastos del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Gastos</h2>
            <div className="p-2 bg-red-500/20 rounded-lg">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="h-10 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-3xl font-bold text-red-400">
                ${estadisticas.gastosMes.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400 mt-2">{getMesActual()}</p>
            </>
          )}
        </motion.div>

        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Balance</h2>
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="h-10 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <>
              <p className={`text-3xl font-bold ${estadisticas.balance >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
                ${estadisticas.balance.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400 mt-2">{getMesActual()}</p>
            </>
          )}
        </motion.div>

        {/* Sesiones del Mes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Sesiones</h2>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
          </div>
          {loading ? (
            <div className="h-10 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-3xl font-bold text-purple-400">
                {estadisticas.sesionesMes}
              </p>
              <p className="text-sm text-slate-400 mt-2">{getMesActual()}</p>
            </>
          )}
        </motion.div>
      </div>

      {/* Cajas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-strong rounded-2xl p-6 shadow-xl mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Saldos en Cajas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-8 bg-white/10 rounded"></div>
                </div>
              ))}
            </>
          ) : (
            cajas.map((caja) => (
              <div key={caja.id} className="glass rounded-xl p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{caja.tipoCaja.nombre}</span>
                  <div className={`p-1.5 rounded-lg ${
                    caja.tipoCaja.nombre === 'Caja' ? 'bg-yellow-500/20' :
                    caja.tipoCaja.nombre === 'BBVA' ? 'bg-blue-500/20' :
                    'bg-green-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      caja.tipoCaja.nombre === 'Caja' ? 'text-yellow-400' :
                      caja.tipoCaja.nombre === 'BBVA' ? 'text-blue-400' :
                      'text-green-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  ${Number(caja.saldoActual).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Accesos Rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-strong rounded-2xl p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold text-white mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/sesiones')}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm">Sesiones</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/cajas')}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm">Cajas</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/catalogos')}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm">Catálogos</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/reportes')}
            className="glass rounded-xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-white font-medium text-sm">Reportes</span>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
