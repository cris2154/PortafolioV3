/** Escapa HTML para poder inyectar texto con `set:html` de forma segura. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convierte el markdown simple que se escribe en Strapi
 * (**negrita**, *cursiva*, `código`, listas con «- » y saltos de línea) a HTML.
 */
export function markdownLite(source: string | null | undefined): string {
  if (!source) return '';

  const inline = (text: string) =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul class="list-disc pl-5 space-y-1">${listItems.join('')}</ul>`);
      listItems = [];
    }
  };

  for (const line of source.split(/\r?\n/)) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      listItems.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    flushList();
    if (line.trim()) html.push(`<p>${inline(line)}</p>`);
  }
  flushList();

  return html.join('');
}

/** `bases_de_datos` → `Bases de datos` */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const text = value.replace(/_/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** `2023-01-10` → `ene 2023` (en español). */
export function formatMonthYear(date: string | null | undefined): string {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('es-PE', { month: 'short', year: 'numeric' }).format(parsed);
}
