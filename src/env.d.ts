/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** URL pública de Strapi, p. ej. http://localhost:1337 */
  readonly PUBLIC_STRAPI_URL?: string;
  /** Token de API opcional (solo servidor). */
  readonly STRAPI_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
