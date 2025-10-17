'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cajasApi, Caja, MovimientoCaja } from '@/lib/api/cajas';

export default function CajasPage() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [creandoMovimiento, setCreandoMovimiento] = useState(false);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);

  const [movimientoForm, setMovimientoForm] = useState({
    tipoMovimiento: 'Ingreso' as 'Ingreso' | 'Retiro',
    concepto: '',
    monto: '',
  });

  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarCajas();
  }, []);

  const cargarCajas = async () => {
    try {
      setLoading(true);
      const response = await cajasApi.listar();
      if (response.success) {
        setCajas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error);
      showToast('Error al cargar cajas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalMovimiento = (caja: Caja) => {
    setCajaSeleccionada(caja);
    setMovimientoForm({
      tipoMovimiento: 'Ingreso',
      concepto: '',
      monto: '',
    });
    setModalMovimiento(true);
  };

  const abrirModalHistorial = async (caja: Caja) => {
    setCajaSeleccionada(caja);
    setModalHistorial(true);
    await cargarMovimientos(caja.id);
  };

  const cargarMovimientos = async (cajaId: number) => {
    try {
      setCargandoMovimientos(true);
      const response = await cajasApi.obtenerMovimientos(cajaId, { limit: 20 });
      if (response.success) {
        setMovimientos(response.data.movimientos);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      showToast('Error al cargar movimientos');
    } finally {
      setCargandoMovimientos(false);
    }
  };

  const handleCrearMovimiento = async () => {
    if (!cajaSeleccionada) return;
    if (creandoMovimiento) return;

    if (!movimientoForm.concepto || !movimientoForm.monto) {
      showToast('Completa todos los campos', 'warning');
      return;
    }

    try {
      setCreandoMovimiento(true);
      const response = await cajasApi.crearMovimiento({
        cajaNombre: cajaSeleccionada.tipoCaja.nombre as 'Caja' | 'BBVA' | 'Efectivo',
        tipoMovimiento: movimientoForm.tipoMovimiento,
        concepto: movimientoForm.concepto,
        monto: Number(movimientoForm.monto),
      });

      if (response.success) {
        setModalMovimiento(false);
        await cargarCajas();
        showToast('Movimiento registrado correctamente', 'success');
      }
    } catch (error: unknown) {
      console.error('Error al crear movimiento:', error);
      showToast((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al registrar movimiento');
    } finally {
      setCreandoMovimiento(false);
    }
  };

  const getCajaColor = (nombre: string) => {
    switch (nombre) {
      case 'Caja':
        return 'purple';
      case 'BBVA':
        return 'blue';
      case 'Efectivo':
        return 'green';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        {/* Header Skeleton */}
        <div className="glass-strong rounded-2xl p-6 mb-6 shadow-xl">
          <div className="h-8 bg-white/10 rounded-lg w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded w-64 animate-pulse"></div>
        </div>

        {/* Cajas Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-strong rounded-2xl p-6 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-white/10 rounded w-20 animate-pulse"></div>
                <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
              </div>

              {/* Amount */}
              <div className="h-10 bg-white/10 rounded-lg w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-24 mb-4 animate-pulse"></div>

              {/* Buttons */}
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-10 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Cajas
        </h1>
        <p className="text-slate-300 text-sm">
          Gestión de cajas y movimientos de dinero
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cajas.map((caja, index) => {
          const color = getCajaColor(caja.tipoCaja.nombre);
          return (
            <motion.div
              key={caja.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="glass-strong rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{caja.tipoCaja.nombre}</h2>
                <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
                  <svg className={`w-6 h-6 text-${color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold text-${color}-400`}>
                ${Number(caja.saldoActual).toFixed(2)}
              </p>
              <p className="text-sm text-slate-400 mt-2 mb-4">Saldo actual</p>

              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalMovimiento(caja)}
                  className={`flex-1 py-2 bg-${color}-500/20 hover:bg-${color}-500/30 text-${color}-400 rounded-lg text-sm font-medium transition-colors`}
                >
                  Movimiento
                </button>
                <button
                  onClick={() => abrirModalHistorial(caja)}
                  className="flex-1 py-2 glass hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Historial
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de Movimiento */}
      <AnimatePresence>
        {modalMovimiento && cajaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMovimiento(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Registrar Movimiento
              </h2>
              <p className="text-slate-300 text-sm mb-4">
                Caja: <span className="font-bold">{cajaSeleccionada.tipoCaja.nombre}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo de Movimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMovimientoForm({ ...movimientoForm, tipoMovimiento: 'Ingreso' })}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        movimientoForm.tipoMovimiento === 'Ingreso'
                          ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                          : 'glass text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Ingreso
                    </button>
                    <button
                      onClick={() => setMovimientoForm({ ...movimientoForm, tipoMovimiento: 'Retiro' })}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        movimientoForm.tipoMovimiento === 'Retiro'
                          ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                          : 'glass text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      Retiro
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={movimientoForm.concepto}
                    onChange={(e) => setMovimientoForm({ ...movimientoForm, concepto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Pago de servicio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={movimientoForm.monto}
                    onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCrearMovimiento}
                    disabled={creandoMovimiento}
                    className={`flex-1 py-3 ${
                      movimientoForm.tipoMovimiento === 'Ingreso'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      creandoMovimiento ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {creandoMovimiento && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {creandoMovimiento ? 'Registrando...' : 'Registrar'}
                  </button>
                  <button
                    onClick={() => setModalMovimiento(false)}
                    disabled={creandoMovimiento}
                    className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Historial */}
        {modalHistorial && cajaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalHistorial(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Historial de Movimientos
                  </h2>
                  <p className="text-slate-300 text-sm">
                    {cajaSeleccionada.tipoCaja.nombre}
                  </p>
                </div>
                <button
                  onClick={() => setModalHistorial(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {cargandoMovimientos ? (
                  <div className="flex items-center justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : movimientos.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-slate-400">No hay movimientos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {movimientos.map((mov) => (
                      <div
                        key={mov.id}
                        className="glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                mov.tipoMovimiento.nombre === 'Ingreso'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {mov.tipoMovimiento.nombre}
                              </span>
                              <span className="text-sm text-slate-400">
                                {format(new Date(mov.fechaRegistro), "dd MMM yyyy, HH:mm", { locale: es })}
                              </span>
                            </div>
                            <p className="text-white font-medium">{mov.concepto}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Por: {mov.usuario.nombre} {mov.usuario.apellidoPaterno}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              mov.tipoMovimiento.nombre === 'Ingreso'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {mov.tipoMovimiento.nombre === 'Ingreso' ? '+' : '-'}${Number(mov.monto).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Saldo: ${Number(mov.saldoNuevo).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
