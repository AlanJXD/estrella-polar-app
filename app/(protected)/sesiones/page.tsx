'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sesionesApi } from '@/lib/api/sesiones';
import { paquetesApi, Paquete } from '@/lib/api/paquetes';
import { SessionCardSkeleton } from '@/components/Shimmer';
import NuevaSesionModal from '@/components/NuevaSesionModal';

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
  const [filtro, setFiltro] = useState('todas');
  const [modalNuevaSesion, setModalNuevaSesion] = useState(false);
  const [creandoSesion, setCreandoSesion] = useState(false);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);

  const [formData, setFormData] = useState({
    fecha: '',
    horaInicial: '',
    horaFinal: '',
    nombreCliente: '',
    celularCliente: '',
    paqueteId: '',
    especificaciones: '',
    anticipo: '',
    montoCaja: '',
  });

  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToast({ message, type });

    // Reproducir sonido de éxito
    if (type === 'success') {
      const audio = new Audio('data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgAAAAAAAEAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADkAOQA5ADkAOAA4ADcANwA2ADUANAAzADIAMQAwAC8ALgAtACwAKwAqACkAKAAnACYAJQAkACMAIgAhACAAHwAeAB0AHAAbABoAGQAYABcAFgAVABQAEwASABEAEAAPAA4ADQAMAAsACgAJAAgABwAGAAUABAADAAIAAQAA');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarSesiones();
    cargarPaquetes();
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

  const cargarPaquetes = async () => {
    try {
      const response = await paquetesApi.listar();
      console.log('Respuesta de paquetes:', response);
      if (response.success) {
        console.log('Paquetes cargados:', response.data);
        setPaquetes(response.data);
      }
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
    }
  };

  const abrirModalNuevaSesion = () => {
    // Establecer fecha de hoy por defecto
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];

    setFormData({
      fecha: fechaStr,
      horaInicial: '',
      horaFinal: '',
      nombreCliente: '',
      celularCliente: '',
      paqueteId: paquetes && paquetes.length > 0 ? String(paquetes[0].id) : '',
      especificaciones: '',
      anticipo: '',
      montoCaja: '',
    });
    setModalNuevaSesion(true);
  };

  const handleCrearSesion = async () => {
    if (creandoSesion) return;

    // Validaciones
    if (!formData.nombreCliente || !formData.fecha || !formData.horaInicial || !formData.horaFinal || !formData.paqueteId) {
      showToast('Completa los campos requeridos', 'warning');
      return;
    }

    try {
      setCreandoSesion(true);
      const response = await sesionesApi.crear({
        fecha: formData.fecha,
        horaInicial: formData.horaInicial,
        horaFinal: formData.horaFinal,
        nombreCliente: formData.nombreCliente,
        celularCliente: formData.celularCliente || undefined,
        paqueteId: Number(formData.paqueteId),
        especificaciones: formData.especificaciones || undefined,
        anticipo: formData.anticipo ? Number(formData.anticipo) : undefined,
        montoCaja: formData.montoCaja ? Number(formData.montoCaja) : undefined,
      });

      if (response.success) {
        setModalNuevaSesion(false);
        await cargarSesiones();
        showToast('Sesión creada exitosamente', 'success');
      }
    } catch (error: unknown) {
      console.error('Error al crear sesión:', error);
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al crear sesión');
    } finally {
      setCreandoSesion(false);
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Sesiones
            </h1>
            <p className="text-slate-300 text-sm">
              Gestión completa de sesiones fotográficas
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={abrirModalNuevaSesion}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nueva Sesión</span>
          </motion.button>
        </div>
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

      {/* Modal Nueva Sesión - Desde Abajo */}
      <AnimatePresence>
        {modalNuevaSesion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !creandoSesion && setModalNuevaSesion(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Nueva Sesión
                </h2>
                <button
                  onClick={() => !creandoSesion && setModalNuevaSesion(false)}
                  disabled={creandoSesion}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre del Cliente */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre del Cliente <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={formData.celularCliente}
                    onChange={(e) => setFormData({ ...formData, celularCliente: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="5512345678"
                  />
                </div>

                {/* Paquete */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Paquete <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.paqueteId}
                    onChange={(e) => setFormData({ ...formData, paqueteId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 [&>option]:bg-slate-800 [&>option]:text-white"
                  >
                    <option value="" className="bg-slate-800 text-white">Selecciona un paquete</option>
                    {paquetes && paquetes.length > 0 ? (
                      paquetes.map((paquete) => (
                        <option key={paquete.id} value={paquete.id} className="bg-slate-800 text-white">
                          {paquete.nombre} - ${Number(paquete.precio).toFixed(2)}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-slate-800 text-slate-400">Cargando paquetes...</option>
                    )}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fecha <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora Inicial <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicial}
                      onChange={(e) => setFormData({ ...formData, horaInicial: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora Final <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.horaFinal}
                      onChange={(e) => setFormData({ ...formData, horaFinal: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Montos */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Anticipo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.anticipo}
                      onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Monto en Caja
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoCaja}
                      onChange={(e) => setFormData({ ...formData, montoCaja: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Especificaciones */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Especificaciones
                  </label>
                  <textarea
                    value={formData.especificaciones}
                    onChange={(e) => setFormData({ ...formData, especificaciones: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detalles adicionales de la sesión..."
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalNuevaSesion(false)}
                    disabled={creandoSesion}
                    className="px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCrearSesion}
                    disabled={creandoSesion}
                    className={`flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      creandoSesion ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {creandoSesion && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {creandoSesion ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-[100] max-w-md"
          >
            <div className={`glass-strong rounded-xl p-4 shadow-2xl border-l-4 ${
              toast.type === 'success' ? 'border-green-500' :
              toast.type === 'warning' ? 'border-yellow-500' :
              'border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {toast.type === 'success' && (
                  <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'warning' && (
                  <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="text-white font-medium">{toast.message}</p>
                <button
                  onClick={() => setToast(null)}
                  className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
