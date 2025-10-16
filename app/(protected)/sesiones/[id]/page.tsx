'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sesionesApi } from '@/lib/api/sesiones';
import { SessionDetailSkeleton } from '@/components/Shimmer';

interface Sesion {
  id: number;
  fecha: string;
  horaInicial: string;
  horaFinal: string;
  nombreCliente: string;
  celularCliente?: string;
  especificaciones?: string;
  comentario?: string;
  paquete: {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: string;
  };
  anticipo: string;
  restante: string;
  montoCaja: string;
  editado: number;
  entregado: number;
  ingresosExtra?: Array<{
    id: number;
    concepto: string;
    monto: string;
  }>;
  gastos?: Array<{
    id: number;
    concepto: string;
    monto: string;
  }>;
  liquidaciones?: Array<{
    id: number;
    monto: string;
    cajaDestino: {
      tipoCaja: {
        nombre: string;
      };
    };
  }>;
  distribucion?: {
    porcentajeItzel: string;
    porcentajeCristian: string;
    porcentajeCesar: string;
    montoItzel: string;
    montoCristian: string;
    montoCesar: string;
    neto: string;
  };
}

export default function SesionDetallePage() {
  const router = useRouter();
  const params = useParams();
  const sesionId = params.id as string;

  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  // Estados de carga para botones
  const [guardando, setGuardando] = useState(false);
  const [agregandoIngreso, setAgregandoIngreso] = useState(false);
  const [agregandoGasto, setAgregandoGasto] = useState(false);
  const [actualizandoCaja, setActualizandoCaja] = useState(false);
  const [agregandoLiquidacion, setAgregandoLiquidacion] = useState(false);
  const [actualizandoDistribucion, setActualizandoDistribucion] = useState(false);

  // Estados para modales
  const [modalIngresoExtra, setModalIngresoExtra] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [modalMontoCaja, setModalMontoCaja] = useState(false);
  const [modalLiquidacion, setModalLiquidacion] = useState(false);
  const [modalDistribucion, setModalDistribucion] = useState(false);

  // Estado para editar distribución
  const [editandoDistribucion, setEditandoDistribucion] = useState(false);
  const [distribucionForm, setDistribucionForm] = useState({
    porcentajeItzel: '33.33',
    porcentajeCristian: '33.33',
    porcentajeCesar: '33.34',
  });

  // Estado para toast/alertas
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [formData, setFormData] = useState({
    nombreCliente: '',
    celularCliente: '',
    fecha: '',
    horaInicial: '',
    horaFinal: '',
    especificaciones: '',
    comentario: '',
    anticipo: '',
    montoCaja: '',
  });

  const [ingresoExtraForm, setIngresoExtraForm] = useState({
    concepto: '',
    monto: '',
  });

  const [gastoForm, setGastoForm] = useState({
    concepto: '',
    monto: '',
  });

  const [montoCajaForm, setMontoCajaForm] = useState('');

  const [liquidacionForm, setLiquidacionForm] = useState({
    monto: '',
    cajaDestinoNombre: 'BBVA' as 'BBVA' | 'Efectivo',
  });

  useEffect(() => {
    cargarSesion();
  }, [sesionId]);

  const cargarSesion = async () => {
    try {
      setLoading(true);
      const response = await sesionesApi.obtener(Number(sesionId));
      if (response.success) {
        setSesion(response.data);
        // Inicializar form data
        const s = response.data;
        setFormData({
          nombreCliente: s.nombreCliente,
          celularCliente: s.celularCliente || '',
          fecha: s.fecha.split('T')[0],
          horaInicial: s.horaInicial.substring(11, 16),
          horaFinal: s.horaFinal.substring(11, 16),
          especificaciones: s.especificaciones || '',
          comentario: s.comentario || '',
          anticipo: s.anticipo,
          montoCaja: s.montoCaja,
        });
        setMontoCajaForm(s.montoCaja);
        // Inicializar distribución si existe
        if (s.distribucion) {
          setDistribucionForm({
            porcentajeItzel: s.distribucion.porcentajeItzel,
            porcentajeCristian: s.distribucion.porcentajeCristian,
            porcentajeCesar: s.distribucion.porcentajeCesar,
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCambios = async () => {
    if (guardando) return;
    try {
      setGuardando(true);
      const response = await sesionesApi.actualizar(Number(sesionId), formData);
      if (response.success) {
        setEditando(false);
        await cargarSesion();
      }
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      showToast('Error al guardar cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarIngresoExtra = async () => {
    if (agregandoIngreso) return;
    try {
      setAgregandoIngreso(true);
      const response = await sesionesApi.agregarIngresoExtra(Number(sesionId), {
        concepto: ingresoExtraForm.concepto,
        monto: Number(ingresoExtraForm.monto)
      });
      if (response.success) {
        setModalIngresoExtra(false);
        setIngresoExtraForm({ concepto: '', monto: '' });
        await cargarSesion();
        showToast('Ingreso extra agregado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al agregar ingreso extra:', error);
      showToast('Error al agregar ingreso extra');
    } finally {
      setAgregandoIngreso(false);
    }
  };

  const handleAgregarGasto = async () => {
    if (agregandoGasto) return;
    try {
      setAgregandoGasto(true);
      const response = await sesionesApi.agregarGasto(Number(sesionId), {
        concepto: gastoForm.concepto,
        monto: Number(gastoForm.monto)
      });
      if (response.success) {
        setModalGasto(false);
        setGastoForm({ concepto: '', monto: '' });
        await cargarSesion();
        showToast('Gasto agregado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al agregar gasto:', error);
      showToast('Error al agregar gasto');
    } finally {
      setAgregandoGasto(false);
    }
  };

  const handleActualizarMontoCaja = async () => {
    if (actualizandoCaja) return;
    try {
      setActualizandoCaja(true);
      const response = await sesionesApi.actualizar(Number(sesionId), {
        montoCaja: Number(montoCajaForm),
      });
      if (response.success) {
        setModalMontoCaja(false);
        await cargarSesion();
        showToast('Monto en caja actualizado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al actualizar monto en caja:', error);
      showToast('Error al actualizar monto en caja');
    } finally {
      setActualizandoCaja(false);
    }
  };

  const handleAgregarLiquidacion = async () => {
    if (agregandoLiquidacion) return;
    try {
      setAgregandoLiquidacion(true);
      const response = await sesionesApi.agregarLiquidacion(Number(sesionId), {
        monto: Number(liquidacionForm.monto),
        cajaDestinoNombre: liquidacionForm.cajaDestinoNombre
      });
      if (response.success) {
        setModalLiquidacion(false);
        setLiquidacionForm({ monto: '', cajaDestinoNombre: 'BBVA' });
        await cargarSesion();
        showToast('Liquidación agregada correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al agregar liquidación:', error);
      showToast('Error al agregar liquidación');
    } finally {
      setAgregandoLiquidacion(false);
    }
  };

  const handleActualizarDistribucion = async () => {
    if (actualizandoDistribucion) return;

    // Validar que sumen 100
    const suma = Number(distribucionForm.porcentajeItzel) +
                 Number(distribucionForm.porcentajeCristian) +
                 Number(distribucionForm.porcentajeCesar);

    if (Math.abs(suma - 100) > 0.01) {
      showToast('Los porcentajes deben sumar 100%', 'warning');
      return;
    }

    try {
      setActualizandoDistribucion(true);
      const response = await sesionesApi.actualizarDistribucion(Number(sesionId), {
        porcentajeItzel: Number(distribucionForm.porcentajeItzel),
        porcentajeCristian: Number(distribucionForm.porcentajeCristian),
        porcentajeCesar: Number(distribucionForm.porcentajeCesar),
      });
      if (response.success) {
        setEditandoDistribucion(false);
        await cargarSesion();
        showToast('Distribución actualizada correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al actualizar distribución:', error);
      showToast('Error al actualizar distribución');
    } finally {
      setActualizandoDistribucion(false);
    }
  };

  if (loading || !sesion) {
    return <SessionDetailSkeleton />;
  }

  const totalIngresos = sesion.ingresosExtra?.reduce((sum, i) => sum + Number(i.monto), 0) || 0;
  const totalGastos = sesion.gastos?.reduce((sum, g) => sum + Number(g.monto), 0) || 0;
  const totalLiquidaciones = sesion.liquidaciones?.reduce((sum, l) => sum + Number(l.monto), 0) || 0;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6 mb-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {sesion.nombreCliente}
              </h1>
              <p className="text-slate-300 text-sm">{sesion.paquete.nombre}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editando ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditando(true)}
                className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/30 transition-colors"
                title="Editar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: guardando ? 1 : 1.05 }}
                  whileTap={{ scale: guardando ? 1 : 0.95 }}
                  onClick={handleGuardarCambios}
                  disabled={guardando}
                  className={`p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors ${
                    guardando ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  title="Guardar"
                >
                  {guardando ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditando(false);
                    cargarSesion();
                  }}
                  disabled={guardando}
                  className="p-2 glass hover:bg-white/10 text-white rounded-xl transition-colors"
                  title="Cancelar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">Información General</h2>

            {editando ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Celular
                  </label>
                  <input
                    type="text"
                    value={formData.celularCliente}
                    onChange={(e) => setFormData({ ...formData, celularCliente: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora Inicial
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicial}
                      onChange={(e) => setFormData({ ...formData, horaInicial: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Hora Final
                    </label>
                    <input
                      type="time"
                      value={formData.horaFinal}
                      onChange={(e) => setFormData({ ...formData, horaFinal: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Especificaciones
                  </label>
                  <textarea
                    value={formData.especificaciones}
                    onChange={(e) => setFormData({ ...formData, especificaciones: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Comentarios
                  </label>
                  <textarea
                    value={formData.comentario}
                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Anticipo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.anticipo}
                    onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Cliente</span>
                  <span className="text-white font-medium">{sesion.nombreCliente}</span>
                </div>
                {sesion.celularCliente && (
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-slate-400">Celular</span>
                    <span className="text-white font-medium">{sesion.celularCliente}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Fecha</span>
                  <span className="text-white font-medium">
                    {format(new Date(sesion.fecha), "dd 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Horario</span>
                  <span className="text-white font-medium">
                    {sesion.horaInicial.substring(0, 5)} - {sesion.horaFinal.substring(0, 5)}
                  </span>
                </div>
                {sesion.especificaciones && (
                  <div className="py-2 border-b border-white/10">
                    <span className="text-slate-400 block mb-1">Especificaciones</span>
                    <span className="text-white">{sesion.especificaciones}</span>
                  </div>
                )}
                {sesion.comentario && (
                  <div className="py-2">
                    <span className="text-slate-400 block mb-1">Comentarios</span>
                    <span className="text-white">{sesion.comentario}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Ingresos y Gastos Extra */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Ingresos y Gastos Extra</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalIngresoExtra(true)}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                >
                  + Ingreso
                </button>
                <button
                  onClick={() => setModalGasto(true)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  + Gasto
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ingresos Extra */}
              {sesion.ingresosExtra && sesion.ingresosExtra.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-400 mb-2">Ingresos Extra</h3>
                  {sesion.ingresosExtra.map((ingreso) => (
                    <div key={ingreso.id} className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-slate-300">{ingreso.concepto}</span>
                      <span className="text-green-400 font-medium">+${Number(ingreso.monto).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Gastos */}
              {sesion.gastos && sesion.gastos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-2">Gastos</h3>
                  {sesion.gastos.map((gasto) => (
                    <div key={gasto.id} className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-slate-300">{gasto.concepto}</span>
                      <span className="text-red-400 font-medium">-${Number(gasto.monto).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {(!sesion.ingresosExtra || sesion.ingresosExtra.length === 0) &&
               (!sesion.gastos || sesion.gastos.length === 0) && (
                <p className="text-center text-slate-400 py-4">
                  No hay ingresos o gastos extra registrados
                </p>
              )}

              <div className="flex justify-between pt-3 border-t-2 border-white/20">
                <span className="text-white font-medium">Neto</span>
                <span className={`font-bold ${
                  totalIngresos - totalGastos >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${(totalIngresos - totalGastos).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Resumen Financiero */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4">Resumen Financiero</h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Paquete</span>
                <span className="text-white font-bold">${Number(sesion.paquete.precio).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Anticipo</span>
                <span className="text-green-400 font-medium">${Number(sesion.anticipo).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Liquidaciones</span>
                <span className="text-green-400 font-medium">${totalLiquidaciones.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Restante</span>
                <span className={`font-medium ${
                  Number(sesion.restante) - totalLiquidaciones > 0 ? 'text-yellow-400' : 'text-slate-400'
                }`}>
                  ${(Number(sesion.restante) - totalLiquidaciones).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Ingresos Extra</span>
                <span className="text-green-400 font-medium">${totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Gastos</span>
                <span className="text-red-400 font-medium">${totalGastos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-slate-400">Agregar Liquidación</span>
                <button
                  onClick={() => setModalLiquidacion(true)}
                  className="px-3 py-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-sm font-medium transition-colors"
                >
                  + Liquidar
                </button>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-white/20">
                <span className="text-white font-bold">Total Neto</span>
                <span className="text-primary-400 font-bold text-lg">
                  ${(Number(sesion.anticipo) + totalLiquidaciones + totalIngresos - totalGastos).toFixed(2)}
                </span>
              </div>

              {/* Distribución de Ingresos */}
              {sesion.distribucion && (
                <div className="mt-6 pt-4 border-t-2 border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Distribución de Ingresos</h3>
                    <button
                      onClick={() => setEditandoDistribucion(!editandoDistribucion)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {editandoDistribucion ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Itzel (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={distribucionForm.porcentajeItzel}
                          onChange={(e) => setDistribucionForm({ ...distribucionForm, porcentajeItzel: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Cristian (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={distribucionForm.porcentajeCristian}
                          onChange={(e) => setDistribucionForm({ ...distribucionForm, porcentajeCristian: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">César (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={distribucionForm.porcentajeCesar}
                          onChange={(e) => setDistribucionForm({ ...distribucionForm, porcentajeCesar: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleActualizarDistribucion}
                          disabled={actualizandoDistribucion}
                          className={`flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors ${
                            actualizandoDistribucion ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {actualizandoDistribucion ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditandoDistribucion(false);
                            if (sesion.distribucion) {
                              setDistribucionForm({
                                porcentajeItzel: sesion.distribucion.porcentajeItzel,
                                porcentajeCristian: sesion.distribucion.porcentajeCristian,
                                porcentajeCesar: sesion.distribucion.porcentajeCesar,
                              });
                            }
                          }}
                          className="px-4 py-2 glass hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-slate-400">Itzel ({Number(sesion.distribucion.porcentajeItzel).toFixed(2)}%)</span>
                        <span className="text-green-400 font-medium">${Number(sesion.distribucion.montoItzel).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-slate-400">Cristian ({Number(sesion.distribucion.porcentajeCristian).toFixed(2)}%)</span>
                        <span className="text-green-400 font-medium">${Number(sesion.distribucion.montoCristian).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">César ({Number(sesion.distribucion.porcentajeCesar).toFixed(2)}%)</span>
                        <span className="text-green-400 font-medium">${Number(sesion.distribucion.montoCesar).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Monto en Caja */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Monto en Caja</h2>
              <button
                onClick={() => setModalMontoCaja(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-primary-400">
              ${Number(sesion.montoCaja).toFixed(2)}
            </p>
          </motion.div>

          {/* Estado */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-white mb-4">Estado</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Editado</span>
                <button
                  onClick={async () => {
                    try {
                      const response = await sesionesApi.actualizar(Number(sesionId), {
                        editado: sesion.editado === 1 ? 0 : 1
                      });
                      if (response.success) {
                        await cargarSesion();
                        showToast('Estado actualizado correctamente', 'success');
                      }
                    } catch (error) {
                      console.error('Error al actualizar estado:', error);
                      showToast('Error al actualizar estado');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sesion.editado === 1
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                  }`}
                >
                  {sesion.editado === 1 ? 'Sí' : 'No'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Entregado</span>
                <button
                  onClick={async () => {
                    try {
                      const response = await sesionesApi.actualizar(Number(sesionId), {
                        entregado: sesion.entregado === 1 ? 0 : 1
                      });
                      if (response.success) {
                        await cargarSesion();
                        showToast('Estado actualizado correctamente', 'success');
                      }
                    } catch (error) {
                      console.error('Error al actualizar estado:', error);
                      showToast('Error al actualizar estado');
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sesion.entregado === 1
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  }`}
                >
                  {sesion.entregado === 1 ? 'Sí' : 'Pendiente'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {/* Modal Ingreso Extra */}
        {modalIngresoExtra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalIngresoExtra(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Agregar Ingreso Extra</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={ingresoExtraForm.concepto}
                    onChange={(e) => setIngresoExtraForm({ ...ingresoExtraForm, concepto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: Impresiones adicionales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ingresoExtraForm.monto}
                    onChange={(e) => setIngresoExtraForm({ ...ingresoExtraForm, monto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAgregarIngresoExtra}
                    disabled={agregandoIngreso}
                    className={`flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      agregandoIngreso ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {agregandoIngreso && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {agregandoIngreso ? 'Agregando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => setModalIngresoExtra(false)}
                    disabled={agregandoIngreso}
                    className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Gasto */}
        {modalGasto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalGasto(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Agregar Gasto</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={gastoForm.concepto}
                    onChange={(e) => setGastoForm({ ...gastoForm, concepto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Ej: Transporte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gastoForm.monto}
                    onChange={(e) => setGastoForm({ ...gastoForm, monto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAgregarGasto}
                    disabled={agregandoGasto}
                    className={`flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      agregandoGasto ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {agregandoGasto && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {agregandoGasto ? 'Agregando...' : 'Agregar'}
                  </button>
                  <button
                    onClick={() => setModalGasto(false)}
                    disabled={agregandoGasto}
                    className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Monto en Caja */}
        {modalMontoCaja && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalMontoCaja(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Modificar Monto en Caja</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={montoCajaForm}
                    onChange={(e) => setMontoCajaForm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleActualizarMontoCaja}
                    disabled={actualizandoCaja}
                    className={`flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      actualizandoCaja ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {actualizandoCaja && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {actualizandoCaja ? 'Actualizando...' : 'Actualizar'}
                  </button>
                  <button
                    onClick={() => setModalMontoCaja(false)}
                    disabled={actualizandoCaja}
                    className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Liquidación */}
        {modalLiquidacion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalLiquidacion(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Agregar Liquidación</h2>
              <p className="text-slate-300 text-sm mb-4">
                Registra el pago del restante del paquete
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={liquidacionForm.monto}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, monto: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Restante por liquidar: ${(Number(sesion.restante) - totalLiquidaciones).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Destino
                  </label>
                  <select
                    value={liquidacionForm.cajaDestinoNombre}
                    onChange={(e) => setLiquidacionForm({ ...liquidacionForm, cajaDestinoNombre: e.target.value as 'BBVA' | 'Efectivo' })}
                    className="w-full px-4 py-2 rounded-lg glass border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="BBVA">BBVA</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAgregarLiquidacion}
                    disabled={agregandoLiquidacion}
                    className={`flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      agregandoLiquidacion ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {agregandoLiquidacion && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {agregandoLiquidacion ? 'Agregando...' : 'Agregar Liquidación'}
                  </button>
                  <button
                    onClick={() => setModalLiquidacion(false)}
                    disabled={agregandoLiquidacion}
                    className="px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast/Alert moderna */}
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
