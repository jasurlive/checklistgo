interface ImportMetaEnv {
  // "false" hides the extra themes (linen, fjord, matte, charcoal, paper); anything else keeps them
  readonly VITE_ENABLE_EXTRA_THEMES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// app version from package.json, set in vite.config.ts
declare const __APP_VERSION__: string
