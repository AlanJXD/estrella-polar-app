export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded-lg ${className}`}
         style={{ animation: 'shimmer 1.5s infinite' }}>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="glass-strong rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Shimmer className="h-6 w-3/4 mb-2" />
          <Shimmer className="h-4 w-1/2" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Shimmer className="h-6 w-20" />
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="mb-3">
        <Shimmer className="h-4 w-full" />
      </div>

      {/* Información Financiera */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
        <div>
          <Shimmer className="h-3 w-16 mb-1" />
          <Shimmer className="h-5 w-20" />
        </div>
        <div>
          <Shimmer className="h-3 w-16 mb-1" />
          <Shimmer className="h-5 w-20" />
        </div>
        <div>
          <Shimmer className="h-3 w-12 mb-1" />
          <Shimmer className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SessionDetailSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shimmer className="h-6 w-6 rounded-lg" />
            <div>
              <Shimmer className="h-8 w-48 mb-2" />
              <Shimmer className="h-4 w-32" />
            </div>
          </div>
          <Shimmer className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <Shimmer className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/10">
                  <Shimmer className="h-4 w-24" />
                  <Shimmer className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingresos y Gastos */}
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Shimmer className="h-6 w-48" />
              <div className="flex gap-2">
                <Shimmer className="h-8 w-24 rounded-lg" />
                <Shimmer className="h-8 w-24 rounded-lg" />
              </div>
            </div>
            <Shimmer className="h-32 w-full" />
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Resumen Financiero */}
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <Shimmer className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/10">
                  <Shimmer className="h-4 w-24" />
                  <Shimmer className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Monto en Caja */}
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <Shimmer className="h-6 w-32 mb-4" />
            <Shimmer className="h-10 w-32" />
          </div>

          {/* Estado */}
          <div className="glass-strong rounded-2xl p-6 shadow-xl">
            <Shimmer className="h-6 w-24 mb-4" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-6 w-16 rounded-lg" />
              </div>
              <div className="flex items-center justify-between">
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-6 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
