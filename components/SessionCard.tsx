'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface SessionCardProps {
  sesion: Sesion;
  onClick: () => void;
}

const formatearHora = (hora: string): string => {
  try {
    const date = new Date(hora);
    return format(date, 'h:mm a');
  } catch {
    // Si falla, intentar extraer solo HH:mm si es un string
    if (typeof hora === 'string' && hora.includes(':')) {
      const [hours, minutes] = hora.substring(0, 5).split(':');
      const h = parseInt(hours);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${period}`;
    }
    return '12:00 AM';
  }
};

export default function SessionCard({ sesion, onClick }: SessionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-strong rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-all shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {sesion.nombreCliente}
          </h3>
          <p className="text-sm text-primary-400 font-medium">
            {sesion.paquete.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2 text-white bg-primary-500/20 px-3 py-1 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">
            {formatearHora(sesion.horaInicial)} - {formatearHora(sesion.horaFinal)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
        {sesion.celularCliente && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{sesion.celularCliente}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-slate-400">Anticipo</p>
            <p className="text-sm font-bold text-green-400">
              ${Number(sesion.anticipo).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Restante</p>
            <p className="text-sm font-bold text-yellow-400">
              ${Number(sesion.restante).toFixed(2)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-sm font-bold text-white">
            ${Number(sesion.paquete.precio).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
