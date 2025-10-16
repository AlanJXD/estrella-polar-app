'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paquetesApi, Paquete } from '@/lib/api/paquetes';

export default function CatalogosPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'crear' | 'editar'>('crear');
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<Paquete | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    porcentajeCesar: '',
    porcentajeCristian: '',
    porcentajeItzel: '',
  });

  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToast({ message, type });
    if (type === 'success') {
      const audio = new Audio('data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgAAAAAAAEAAgADAAQABQAGAAcACAAJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADkAOQA5ADkAOAA4ADcANwA2ADUANAAzADIAMQAwAC8ALgAtACwAKwAqACkAKAAnACYAJQAkACMAIgAhACAAHwAeAB0AHAAbABoAGQAYABcAFgAVABQAEwASABEAEAAPAA4ADQAMAAsACgAJAAgABwAGAAUABAADAAIAAQAA');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    try {
      setLoading(true);
      const response = await paquetesApi.listar();
      if (response.success) {
        setPaquetes(response.data);
      }
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
      showToast('Error al cargar paquetes');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setModalMode('crear');
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      porcentajeCesar: '33.34',
      porcentajeCristian: '33.33',
      porcentajeItzel: '33.33',
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (paquete: Paquete) => {
    setModalMode('editar');
    setPaqueteSeleccionado(paquete);
    setFormData({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion || '',
      precio: paquete.precio,
      porcentajeCesar: paquete.porcentajeCesar || '33.34',
      porcentajeCristian: paquete.porcentajeCristian || '33.33',
      porcentajeItzel: paquete.porcentajeItzel || '33.33',
    });
    setModalOpen(true);
  };

  const abrirModalEliminar = (paquete: Paquete) => {
    setPaqueteSeleccionado(paquete);
    setModalEliminar(true);
  };

  const handleGuardar = async () => {
    if (guardando) return;

    if (!formData.nombre || !formData.precio) {
      showToast('Completa los campos requeridos', 'warning');
      return;
    }

    try {
      setGuardando(true);

      if (modalMode === 'crear') {
        const response = await paquetesApi.crear({
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          precio: Number(formData.precio),
          porcentajeCesar: Number(formData.porcentajeCesar) || undefined,
          porcentajeCristian: Number(formData.porcentajeCristian) || undefined,
          porcentajeItzel: Number(formData.porcentajeItzel) || undefined,
        });

        if (response.success) {
          showToast('Paquete creado exitosamente', 'success');
          setModalOpen(false);
          await cargarPaquetes();
        }
      } else {
        if (!paqueteSeleccionado) return;

        const response = await paquetesApi.actualizar(paqueteSeleccionado.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          precio: Number(formData.precio),
          porcentajeCesar: Number(formData.porcentajeCesar) || undefined,
          porcentajeCristian: Number(formData.porcentajeCristian) || undefined,
          porcentajeItzel: Number(formData.porcentajeItzel) || undefined,
        });

        if (response.success) {
          showToast('Paquete actualizado exitosamente', 'success');
          setModalOpen(false);
          await cargarPaquetes();
        }
      }
    } catch (error: any) {
      console.error('Error al guardar paquete:', error);
      showToast(error.response?.data?.message || 'Error al guardar paquete');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (eliminando || !paqueteSeleccionado) return;

    try {
      setEliminando(true);
      const response = await paquetesApi.eliminar(paqueteSeleccionado.id);

      if (response.success) {
        showToast('Paquete eliminado exitosamente', 'success');
        setModalEliminar(false);
        await cargarPaquetes();
      }
    } catch (error: any) {
      console.error('Error al eliminar paquete:', error);
      showToast(error.response?.data?.message || 'Error al eliminar paquete');
    } finally {
      setEliminando(false);
    }
  };

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
              Catálogos
            </h1>
            <p className="text-slate-300 text-sm">
              Gestión de paquetes fotográficos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={abrirModalCrear}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuevo Paquete</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-strong rounded-2xl p-6 shadow-xl animate-pulse">
                <div className="h-12 bg-white/10 rounded mb-4"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
              </div>
            ))}
          </>
        ) : paquetes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-400">No hay paquetes registrados</p>
          </div>
        ) : (
          paquetes.map((paquete, index) => (
            <motion.div
              key={paquete.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-strong rounded-2xl p-6 shadow-xl hover:bg-white/5 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-500/20 rounded-xl">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  paquete.activo === 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {paquete.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{paquete.nombre}</h3>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{paquete.descripcion || 'Sin descripción'}</p>

              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-slate-400">Precio</span>
                  <span className="text-2xl font-bold text-primary-400">${Number(paquete.precio).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Itzel</span>
                    <span className="text-slate-300">{paquete.porcentajeItzel}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Cristian</span>
                    <span className="text-slate-300">{paquete.porcentajeCristian}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">César</span>
                    <span className="text-slate-300">{paquete.porcentajeCesar}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalEditar(paquete)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => abrirModalEliminar(paquete)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !guardando && setModalOpen(false)}
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
                  {modalMode === 'crear' ? 'Nuevo Paquete' : 'Editar Paquete'}
                </h2>
                <button
                  onClick={() => !guardando && setModalOpen(false)}
                  disabled={guardando}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Paquete Básico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Sesión de 1 hora con 10 fotos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Precio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Distribución de Porcentajes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Itzel %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.porcentajeItzel}
                        onChange={(e) => setFormData({ ...formData, porcentajeItzel: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="33.33"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Cristian %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.porcentajeCristian}
                        onChange={(e) => setFormData({ ...formData, porcentajeCristian: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="33.33"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">César %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.porcentajeCesar}
                        onChange={(e) => setFormData({ ...formData, porcentajeCesar: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="33.34"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={guardando}
                    className="px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className={`flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      guardando ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {guardando && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Eliminar */}
      <AnimatePresence>
        {modalEliminar && paqueteSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !eliminando && setModalEliminar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¿Eliminar paquete?</h3>
                <p className="text-slate-300 mb-6">
                  ¿Estás seguro de que quieres eliminar el paquete <strong>{paqueteSeleccionado.nombre}</strong>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalEliminar(false)}
                    disabled={eliminando}
                    className="flex-1 px-4 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={eliminando}
                    className={`flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      eliminando ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {eliminando && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {eliminando ? 'Eliminando...' : 'Eliminar'}
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
