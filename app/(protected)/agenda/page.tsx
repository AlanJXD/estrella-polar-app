'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { sesionesApi } from '@/lib/api/sesiones';
import Calendar from '@/components/Calendar';
import SessionCard from '@/components/SessionCard';

interface Sesion {
  id: number;
  fecha: string;
  horaInicial: string;
  horaFinal: string;
  nombreCliente: string;
  celularCliente?: string;
  paquete: {
    nombre: string;
    precio: number;
  };
  anticipo: number;
  restante: number;
}

export default function AgendaPage() {
  const router = useRouter();
  const { isAuthenticated, usuario, clearAuth } = useAuthStore();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Esperar a que el store se hidrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    cargarSesiones();
  }, [isHydrated, isAuthenticated, router]);

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

  // Contar sesiones por fecha
  const sesionesCount = useMemo(() => {
    const count: { [key: string]: number } = {};
    sesiones.forEach((sesion) => {
      const dateKey = format(new Date(sesion.fecha), 'yyyy-MM-dd');
      count[dateKey] = (count[dateKey] || 0) + 1;
    });
    return count;
  }, [sesiones]);

  // Filtrar sesiones del día seleccionado
  const sesionesFiltradas = useMemo(() => {
    return sesiones
      .filter((sesion) => {
        const sesionDate = new Date(sesion.fecha);
        return isSameDay(sesionDate, selectedDate);
      })
      .sort((a, b) => a.horaInicial.localeCompare(b.horaInicial));
  }, [sesiones, selectedDate]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Agenda
            </h1>
            <p className="text-slate-300 text-sm">
              Bienvenido, {usuario?.nombre}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sesiones/nueva')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-colors"
            >
              + Nueva Sesión
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-4 py-2 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
            >
              Salir
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            sesionesCount={sesionesCount}
          />
        </motion.div>

        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </h2>
              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium">
                {sesionesFiltradas.length} sesiones
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {sesionesFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-slate-400 text-sm">
                    No hay sesiones programadas para este día
                  </p>
                </div>
              ) : (
                sesionesFiltradas.map((sesion) => (
                  <SessionCard
                    key={sesion.id}
                    sesion={sesion}
                    onClick={() => setSelectedSesion(sesion)}
                  />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSesion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSesion(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Detalle de Sesión
                </h2>
                <button
                  onClick={() => setSelectedSesion(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-slate-200">
                <div>
                  <p className="text-sm text-slate-400">Cliente</p>
                  <p className="font-semibold text-lg">{selectedSesion.nombreCliente}</p>
                </div>

                {selectedSesion.celularCliente && (
                  <div>
                    <p className="text-sm text-slate-400">Teléfono</p>
                    <p className="font-semibold">{selectedSesion.celularCliente}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-400">Paquete</p>
                  <p className="font-semibold">{selectedSesion.paquete.nombre}</p>
                  <p className="text-sm text-primary-400 font-medium">
                    ${Number(selectedSesion.paquete.precio).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Horario</p>
                  <p className="font-semibold text-lg">
                    {selectedSesion.horaInicial.substring(0, 5)} - {selectedSesion.horaFinal.substring(0, 5)}
                  </p>
                  <p className="text-sm text-slate-300">
                    {format(new Date(selectedSesion.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-slate-400">Anticipo</p>
                    <p className="font-bold text-lg text-green-400">
                      ${Number(selectedSesion.anticipo).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Restante</p>
                    <p className="font-bold text-lg text-yellow-400">
                      ${Number(selectedSesion.restante).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/sesiones/${selectedSesion.id}`)}
                  className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                >
                  Ver Detalles Completos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSesion(null)}
                  className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
