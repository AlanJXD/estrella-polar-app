'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sesionesApi } from '@/lib/api/sesiones';
import { SessionCardSkeleton } from '@/components/Shimmer';

interface Sesion {
  id: number;
  fecha: string;
  horaInicial: string;
  horaFinal: string;
  nombreCliente: string;
  celularCliente?: string;
  paquete: {
    nombre: string;
    precio: string;
  };
  anticipo: string;
  restante: string;
  montoCaja: string;
  editado: number;
  entregado: number;
  liquidaciones?: Array<{
    id: number;
    monto: string;
  }>;
}

export default function SesionesPage() {
  const router = useRouter();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // todas, pendientes, entregadas

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    try {
      setLoading(true);
      const response = await sesionesApi.listar();
      if (response.success) {
        setSesiones(response.data.sesiones);
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const totalLiquidaciones = sesion.liquidaciones?.reduce((sum, l) => sum + Number(l.monto), 0) || 0;
    const restanteReal = Number(sesion.restante) - totalLiquidaciones;

    if (filtro === 'entregadas') return sesion.entregado === 1;
    if (filtro === 'pendientes') return sesion.entregado === 0 || restanteReal > 0;
    return true;
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Sesiones
        </h1>
        <p className="text-slate-300 text-sm">
          Gestión completa de sesiones fotográficas
        </p>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6"
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              filtro === 'todas'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Todas ({sesiones.length})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              filtro === 'pendientes'
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Pendientes ({sesiones.filter(s => {
              const totalLiquidaciones = s.liquidaciones?.reduce((sum, l) => sum + Number(l.monto), 0) || 0;
              const restanteReal = Number(s.restante) - totalLiquidaciones;
              return s.entregado === 0 || restanteReal > 0;
            }).length})
          </button>
          <button
            onClick={() => setFiltro('entregadas')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
              filtro === 'entregadas'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Entregadas ({sesiones.filter(s => s.entregado === 1).length})
          </button>
        </div>
      </motion.div>

      {/* Lista de Sesiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Show shimmer skeletons while loading
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </>
        ) : sesionesFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No hay sesiones que mostrar</p>
          </div>
        ) : (
          sesionesFiltradas.map((sesion, index) => (
            <motion.div
              key={sesion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/sesiones/${sesion.id}`)}
              className="glass-strong rounded-xl p-5 cursor-pointer hover:bg-white/15 transition-all shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {sesion.nombreCliente}
                  </h3>
                  <p className="text-sm text-primary-400">{sesion.paquete.nombre}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {sesion.entregado === 1 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                      Entregado
                    </span>
                  )}
                  {sesion.editado === 1 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                      Editado
                    </span>
                  )}
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(new Date(sesion.fecha), "dd MMM yyyy", { locale: es })}</span>
                <span className="text-slate-500">•</span>
                <span>{sesion.horaInicial.substring(0, 5)} - {sesion.horaFinal.substring(0, 5)}</span>
              </div>

              {/* Información Financiera */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">Anticipo</p>
                  <p className="text-sm font-bold text-green-400">${Number(sesion.anticipo).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Restante</p>
                  <p className={`text-sm font-bold ${
                    (() => {
                      const totalLiquidaciones = sesion.liquidaciones?.reduce((sum, l) => sum + Number(l.monto), 0) || 0;
                      const restanteReal = Number(sesion.restante) - totalLiquidaciones;
                      return restanteReal > 0 ? 'text-yellow-400' : 'text-slate-400';
                    })()
                  }`}>
                    ${(() => {
                      const totalLiquidaciones = sesion.liquidaciones?.reduce((sum, l) => sum + Number(l.monto), 0) || 0;
                      const restanteReal = Number(sesion.restante) - totalLiquidaciones;
                      return restanteReal.toFixed(2);
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-sm font-bold text-white">${Number(sesion.paquete.precio).toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
