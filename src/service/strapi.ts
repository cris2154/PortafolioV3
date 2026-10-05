import type {
  ConfiguracionGlobal,
  Experiencia,
  Habilidad,
  MensajeContactoInput,
  Perfil,
  PreguntaFrecuente,
  Proyecto,
  StrapiCollectionResponse,
  StrapiMedia,
  StrapiSingleResponse,
} from './types';

/* ------------------------------ Configuración ------------------------------ */

const DEFAULT_STRAPI_URL = 'http://localhost:1337';

/** URL base de Strapi, sin barra final. Se define con `PUBLIC_STRAPI_URL`. */
export const STRAPI_URL: string = (
  import.meta.env.PUBLIC_STRAPI_URL ?? DEFAULT_STRAPI_URL
).replace(/\/+$/, '');

/** Token opcional (solo servidor). Úsalo si la API no es pública. */
const STRAPI_TOKEN: string | undefined = import.meta.env.STRAPI_API_TOKEN;

/* -------------------------------- Errores -------------------------------- */

export class StrapiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

/* ---------------------------- Cliente HTTP base ---------------------------- */

type QueryValue = string | number | boolean;
type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  /** Parámetros de Strapi, p. ej. `{ 'filters[slug][$eq]': 'mi-proyecto' }`. */
  params?: QueryParams;
  method?: 'GET' | 'POST';
  body?: unknown;
}

/**
 * En producción (build estático) se reutiliza la misma respuesta entre componentes
 * para no consultar el mismo endpoint varias veces. En desarrollo no se cachea,
 * así los cambios hechos en Strapi se ven al recargar.
 */
const cache = new Map<string, Promise<unknown>>();

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${STRAPI_URL}/api/${path.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function execute<T>(url: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (cause) {
    throw new StrapiError(
      `No se pudo conectar con Strapi en ${STRAPI_URL}. ¿Está corriendo el servidor?`,
      undefined,
      url,
      cause,
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? response.statusText;
    console.error(`❌ Error en Strapi (${response.status}):`, payload?.error);
    throw new StrapiError(
      `Strapi respondió ${response.status}: ${message}`,
      response.status,
      url,
      payload?.error,
    );
  }

  return payload as T;
}

/** Ejecuta con reintentos automáticos si ocurre un fallo momentáneo de red/servidor. */
async function executeWithRetry<T>(url: string, options: RequestOptions, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
      return await execute<T>(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`⚠️ [Strapi Retry ${attempt + 1}/${maxRetries}] Reintentando petición a ${url}...`);
      }
    }
  }
  throw lastError;
}

/** Petición genérica y reutilizable a cualquier endpoint de `/api`. */
export function strapiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.params);
  const isGet = (options.method ?? 'GET') === 'GET';

  if (!isGet) return executeWithRetry<T>(url, options);

  // Compartir peticiones en curso (deduplicación) para evitar que múltiples componentes saturen a Strapi
  let pending = cache.get(url) as Promise<T> | undefined;
  if (!pending) {
    pending = executeWithRetry<T>(url, options);
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);

    // En desarrollo, limpiar la caché a los 2.5s para no bloquear cambios en Strapi al recargar
    if (!import.meta.env.PROD) {
      setTimeout(() => cache.delete(url), 2500);
    }
  }
  return pending;
}

const POPULATE_ALL: QueryParams = { populate: '*' };
const PAGE_SIZE: QueryParams = { 'pagination[pageSize]': 100 };

/* --------------------------------- Media --------------------------------- */

/**
 * Devuelve la URL absoluta de un archivo subido a Strapi.
 * Acepta un tamaño (`small`, `medium`...) y cae a la imagen original si no existe.
 */
export function getMediaUrl(
  media: StrapiMedia | null | undefined,
  size?: 'thumbnail' | 'small' | 'medium' | 'large',
): string | null {
  if (!media) return null;
  const url = (size && media.formats?.[size]?.url) || media.url;
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `${STRAPI_URL}${url}`;
}

/* ----------------------------- Single types ----------------------------- */

/** GET /api/configuracion-global */
export async function getConfiguracionGlobal(): Promise<ConfiguracionGlobal> {
  const res = await strapiRequest<StrapiSingleResponse<ConfiguracionGlobal>>(
    'configuracion-global',
    { params: POPULATE_ALL },
  );
  return res.data;
}

/** GET /api/perfil — datos del Hero y «Acerca de». */
export async function getPerfil(): Promise<Perfil> {
  const res = await strapiRequest<StrapiSingleResponse<Perfil>>('perfil', {
    params: POPULATE_ALL,
  });
  return res.data;
}

/* --------------------------- Collection types --------------------------- */

/** GET /api/proyectos — ordenados por el campo `orden`. */
export async function getProyectos(): Promise<Proyecto[]> {
  try {
    const res = await strapiRequest<StrapiCollectionResponse<Proyecto>>('proyectos', {
      params: { ...POPULATE_ALL, ...PAGE_SIZE, 'sort[0]': 'orden:asc' },
    });
    return res?.data ?? [];
  } catch (err) {
    console.error('❌ Error al obtener proyectos de Strapi:', err);
    return [];
  }
}

/** GET /api/proyectos/:documentId */
export async function getProyecto(documentId: string): Promise<Proyecto> {
  const res = await strapiRequest<StrapiSingleResponse<Proyecto>>(
    `proyectos/${encodeURIComponent(documentId)}`,
    { params: POPULATE_ALL },
  );
  return res.data;
}

/** GET /api/proyectos?filters[slug][$eq]=<slug> — devuelve `null` si no existe. */
export async function getProyectoBySlug(slug: string): Promise<Proyecto | null> {
  const res = await strapiRequest<StrapiCollectionResponse<Proyecto>>('proyectos', {
    params: { ...POPULATE_ALL, 'filters[slug][$eq]': slug },
  });
  return res.data[0] ?? null;
}

/** GET /api/experiencias — de la más reciente a la más antigua. */
export async function getExperiencias(): Promise<Experiencia[]> {
  try {
    const res = await strapiRequest<StrapiCollectionResponse<Experiencia>>('experiencias', {
      params: { ...POPULATE_ALL, ...PAGE_SIZE, 'sort[0]': 'fecha_inicio:desc' },
    });
    return res?.data ?? [];
  } catch (err) {
    console.error('❌ Error al obtener experiencias de Strapi:', err);
    return [];
  }
}

/** GET /api/experiencias/:documentId */
export async function getExperiencia(documentId: string): Promise<Experiencia> {
  const res = await strapiRequest<StrapiSingleResponse<Experiencia>>(
    `experiencias/${encodeURIComponent(documentId)}`,
    { params: POPULATE_ALL },
  );
  return res.data;
}

/** GET /api/habilidades — habilidades y certificaciones. */
export async function getHabilidades(): Promise<Habilidad[]> {
  try {
    const res = await strapiRequest<StrapiCollectionResponse<Habilidad>>('habilidades', {
      params: { ...POPULATE_ALL, ...PAGE_SIZE },
    });
    return res?.data ?? [];
  } catch (err) {
    console.error('❌ Error al obtener habilidades de Strapi:', err);
    return [];
  }
}

/** GET /api/habilidades/:documentId */
export async function getHabilidad(documentId: string): Promise<Habilidad> {
  const res = await strapiRequest<StrapiSingleResponse<Habilidad>>(
    `habilidades/${encodeURIComponent(documentId)}`,
    { params: POPULATE_ALL },
  );
  return res.data;
}

/** GET /api/preguntas-frecuentes — ordenadas por el campo `orden`. */
export async function getPreguntasFrecuentes(): Promise<PreguntaFrecuente[]> {
  const res = await strapiRequest<StrapiCollectionResponse<PreguntaFrecuente>>(
    'preguntas-frecuentes',
    { params: { ...PAGE_SIZE, 'sort[0]': 'orden:asc' } },
  );
  return res.data;
}

/** GET /api/preguntas-frecuentes/:documentId */
export async function getPreguntaFrecuente(documentId: string): Promise<PreguntaFrecuente> {
  const res = await strapiRequest<StrapiSingleResponse<PreguntaFrecuente>>(
    `preguntas-frecuentes/${encodeURIComponent(documentId)}`,
  );
  return res.data;
}

/* -------------------------------- Escritura -------------------------------- */

/** POST /api/mensajes-contacto — envía el formulario de contacto. */
export async function enviarMensajeContacto(input: MensajeContactoInput): Promise<void> {
  await strapiRequest('mensajes-contacto', {
    method: 'POST',
    body: { data: input },
  });
}
