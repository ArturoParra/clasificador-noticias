# News Classifier - Analizador de Credibilidad de Noticias 📰

Una aplicación web moderna diseñada para analizar, clasificar y evaluar la credibilidad de noticias utilizando métricas simuladas de inteligencia artificial. Este proyecto ayuda a los usuarios a navegar por el contenido de noticias con una capa adicional de análisis crítico sobre la veracidad y el sesgo de la información.

## ✨ Características Principales

- **Feed de Noticias Interactivo**: Exploración fluida de artículos con tarjetas informativas ricas en detalles.
- **Análisis de IA**: Desglose detallado de factores de credibilidad (positivos, negativos, neutrales) para cada noticia.
- **Puntuación de Credibilidad**: Sistema visual de puntuación y barras de progreso para evaluar rápidamente la fiabilidad de una fuente.
- **Insignias de Verificación**: Distintivos visuales para identificar fuentes verificadas o cuestionables.
- **Búsqueda y Filtrado Avanzado**: Herramientas potentes para buscar por palabras clave, categorías y rangos de fechas.
- **Panel de Estadísticas**: Visualización de datos y tendencias mediante gráficos interactivos (Recharts).
- **Gestión de Favoritos**: Funcionalidad para guardar y organizar artículos de interés.
- **Modo Oscuro/Claro**: Interfaz adaptable a las preferencias del usuario con `next-themes`.
- **Diseño Responsivo**: Experiencia de usuario optimizada para móviles, tablets y escritorio.

## 🛠️ Stack Tecnológico

Este proyecto está construido con herramientas modernas de desarrollo web:

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilizado**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (basado en Radix UI)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Enrutamiento**: [React Router v7](https://reactrouter.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Manejo de Formularios**: [React Hook Form](https://react-hook-form.com/)
- **Animaciones**: [Motion](https://motion.dev/)

## 🚀 Instalación y Uso

Sigue estos pasos para ejecutar el proyecto localmente:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/news-classifier.git
   cd news-classifier
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir para producción**
   ```bash
   npm run build
   ```

## 📂 Estructura del Proyecto

- `src/components`: Componentes reutilizables de la UI y componentes específicos de la aplicación (NewsCard, AnalysisBreakdown, etc.).
- `src/context`: Manejo del estado global (NewsContext).
- `src/data`: Datos simulados (mockNews) para desarrollo y pruebas.
- `src/styles`: Configuraciones globales de CSS y temas.
- `src/types`: Definiciones de tipos TypeScript para mantener la seguridad de tipos.

// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
