/**
 * Tipos de la API de Strapi (v5, respuestas planas con `documentId`).
 * Reflejan los campos reales devueltos por el CMS del portafolio.
 */

/* ----------------------------- Genéricos ----------------------------- */

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination?: StrapiPagination;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiEntry {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

/* ------------------------------- Media ------------------------------- */

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: Partial<
    Record<'thumbnail' | 'small' | 'medium' | 'large', StrapiMediaFormat>
  > | null;
  mime: string;
  url: string;
}

/* ---------------------- Bloques de texto enriquecido ---------------------- */

export interface BlockTextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface BlockLinkNode {
  type: 'link';
  url: string;
  children: BlockTextNode[];
}

export type BlockInlineNode = BlockTextNode | BlockLinkNode;

export interface BlockListItemNode {
  type: 'list-item';
  children: BlockInlineNode[];
}

export type Block =
  | { type: 'paragraph'; children: BlockInlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: BlockInlineNode[] }
  | { type: 'quote'; children: BlockInlineNode[] }
  | { type: 'code'; children: BlockInlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: BlockListItemNode[] };

/* ------------------------- Single types ------------------------- */

export type RedSocialTipo =
  | 'github'
  | 'linkedin'
  | 'twitter_x'
  | 'instagram'
  | 'youtube'
  | 'correo'
  | (string & {});

export interface RedSocial {
  id: number;
  red: RedSocialTipo;
  url: string;
  etiqueta: string | null;
}

export interface Seo {
  id: number;
  meta_titulo: string | null;
  meta_descripcion: string | null;
}

/** GET /api/configuracion-global */
export interface ConfiguracionGlobal extends StrapiEntry {
  nombre_sitio: string;
  descripcion_sitio: string | null;
  disponible_para_trabajar: boolean;
  correo_contacto: string | null;
  curriculum_pdf: StrapiMedia | null;
  redes_sociales: RedSocial[];
  seo_predeterminado: Seo | null;
}

/** GET /api/perfil */
export interface Perfil extends StrapiEntry {
  titular_hero: string;
  subtitulo_hero: string | null;
  biografia_acerca_de: Block[] | null;
  ubicacion: string | null;
  anios_experiencia: number | null;
  avatar_foto: StrapiMedia | null;
}

/* ------------------------- Collection types ------------------------- */

export type HabilidadCategoria =
  | 'frontend'
  | 'backend'
  | 'bases_de_datos'
  | 'devops_cloud'
  | 'mobile'
  | 'herramientas'
  | 'blandas'
  | (string & {});

/** GET /api/habilidades */
export interface Habilidad extends StrapiEntry {
  nombre: string;
  categoria: HabilidadCategoria;
  es_certificada: boolean;
  institucion_emisora: string | null;
  fecha_emision: string | null;
  id_credencial: string | null;
  enlace_credencial: string | null;
  icono?: StrapiMedia | null;
  archivo_certificado?: StrapiMedia | null;
}

export interface CaracteristicaClave {
  id: number;
  titulo: string;
  descripcion: string;
}

export interface MetricaImpacto {
  id: number;
  valor: string;
  descripcion: string;
}

export type ProyectoEstado = 'en_desarrollo' | 'en_produccion' | 'archivado' | (string & {});

/** GET /api/proyectos */
export interface Proyecto extends StrapiEntry {
  titulo: string;
  slug: string;
  lema: string | null;
  rol_desempenado: string | null;
  cliente_o_contexto: string | null;
  duracion: string | null;
  estado: ProyectoEstado;
  acerca_del_proyecto: string | null;
  el_desafio: string | null;
  la_solucion: string | null;
  enlace_demo: string | null;
  enlace_repositorio: string | null;
  destacado: boolean;
  orden: number | null;
  caracteristicas_clave: CaracteristicaClave[];
  metricas_impacto: MetricaImpacto[];
  imagen_portada: StrapiMedia | null;
  galeria: StrapiMedia[] | null;
  tecnologias: Habilidad[];
}

export type ExperienciaTipoEmpleo = 'tiempo_completo' | 'freelance' | (string & {});
export type ExperienciaModalidad = 'remoto' | 'hibrido' | 'presencial' | (string & {});

/** GET /api/experiencias */
export interface Experiencia extends StrapiEntry {
  puesto: string;
  empresa: string;
  tipo_empleo: ExperienciaTipoEmpleo;
  modalidad: ExperienciaModalidad;
  fecha_inicio: string;
  fecha_fin: string | null;
  es_trabajo_actual: boolean;
  descripcion: string | null;
  logo_empresa: StrapiMedia | null;
  imagenes_empresa?: StrapiMedia[] | null;
  habilidades_usadas: Habilidad[];
}

/** GET /api/preguntas-frecuentes */
export interface PreguntaFrecuente extends StrapiEntry {
  pregunta: string;
  respuesta: string;
  categoria: string | null;
  orden: number | null;
}

/** POST /api/mensajes-contacto */
export interface MensajeContactoInput {
  nombre_completo: string;
  correo: string;
  mensaje: string;
}
