# Estrella Polar Estudio - Frontend

PWA para gestión de sesiones fotográficas del estudio "Estrella Polar".

## Tecnologías

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first con tema dark personalizado
- **PWA** - Optimizado para iOS con liquid glass UI
- **Framer Motion** - Animaciones modernas y fluidas
- **Calendario personalizado** - Componente custom con date-fns
- **Zustand** - Estado global minimalista
- **Axios** - Cliente HTTP para API REST
- **date-fns** - Manipulación de fechas

## Características

- ✅ Login con liquid glass design
- ✅ Agenda con calendario visual
- ✅ Autenticación JWT persistente
- ✅ PWA optimizado para iOS
- ✅ Tema dark con azul primario
- ✅ Animaciones suaves con Framer Motion
- ✅ Diseño responsive y mobile-first

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Servidor de Desarrollo

El servidor inicia en `http://localhost:3001` (puerto 3000 ocupado por API)

## Estructura del Proyecto

```
estrella-polar-app/
├── app/
│   ├── login/
│   │   └── page.tsx          # Vista de login con liquid glass
│   ├── agenda/
│   │   └── page.tsx          # Vista de agenda con calendario
│   ├── layout.tsx            # Layout principal con metadata PWA
│   ├── page.tsx              # Redirección a login/agenda
│   └── globals.css           # Estilos globales Tailwind
├── lib/
│   ├── api/
│   │   ├── client.ts         # Cliente axios configurado
│   │   ├── auth.ts           # Endpoints de autenticación
│   │   └── sesiones.ts       # Endpoints de sesiones
│   └── store/
│       └── authStore.ts      # Store de autenticación con Zustand
├── public/
│   └── manifest.json         # Manifest PWA para iOS
├── tailwind.config.js        # Configuración Tailwind con tema dark
└── next.config.ts            # Configuración Next.js con PWA
```

## Rutas

- `/` - Redirección automática según estado de autenticación
- `/login` - Página de inicio de sesión
- `/agenda` - Calendario de sesiones (requiere auth)

## Tema de Colores

```javascript
primary: {
  50: '#eff6ff',   // Azul muy claro
  500: '#3b82f6',  // Azul principal
  600: '#2563eb',  // Azul oscuro
  900: '#1e3a8a',  // Azul muy oscuro
}
```

## Componentes Personalizados

### Clases CSS Utility

- `.glass` - Efecto liquid glass sutil
- `.glass-strong` - Efecto liquid glass intenso
- `.ios-blur` - Blur estilo iOS con gradiente

## Próximas Funcionalidades

- [ ] Vista de detalle de sesión
- [ ] Formulario para crear nueva sesión
- [ ] Vista de finanzas con gráficas
- [ ] Vista de cajas con saldos
- [ ] Vista de paquetes (CRUD)
- [ ] Vista de reportes
- [ ] Notificaciones push
- [ ] Modo offline

## Notas de Desarrollo

- El backend API debe estar corriendo en `http://localhost:3000`
- Usuario de prueba: `alan` / `admin`
- La autenticación se persiste en localStorage
- PWA instalable desde Safari en iOS

## Licencia

MIT
"# estrella-polar-app" 
