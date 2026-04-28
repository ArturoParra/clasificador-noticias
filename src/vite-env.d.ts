interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega aquí otras variables que vayas creando
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}