'use client';

import { motion } from 'framer-motion';

export default function CatalogosPage() {

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
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
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-colors"
          >
            + Nuevo Paquete
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Paquete Básico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 shadow-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
              Activo
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Paquete Básico</h3>
          <p className="text-sm text-slate-400 mb-4">Sesión de 1 hora con 10 fotos</p>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm text-slate-400">Precio</span>
              <span className="text-2xl font-bold text-primary-400">$1,500</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Itzel</span>
                <span className="text-slate-300">33.33%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cristian</span>
                <span className="text-slate-300">33.33%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">César</span>
                <span className="text-slate-300">33.34%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Paquete Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 shadow-xl hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
              Activo
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Paquete Premium</h3>
          <p className="text-sm text-slate-400 mb-4">Sesión de 2 horas con 25 fotos y álbum</p>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm text-slate-400">Precio</span>
              <span className="text-2xl font-bold text-yellow-400">$3,000</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Itzel</span>
                <span className="text-slate-300">33.33%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cristian</span>
                <span className="text-slate-300">33.33%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">César</span>
                <span className="text-slate-300">33.34%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agregar nuevo paquete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 shadow-xl border-2 border-dashed border-slate-600 hover:border-primary-500 transition-all cursor-pointer flex items-center justify-center"
        >
          <div className="text-center">
            <div className="p-4 bg-slate-700/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Agregar Paquete</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
