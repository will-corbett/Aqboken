/** Learn pages: content/learn/<topic>.md, bundled at build time. */
const files = import.meta.glob('/content/learn/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
export const LEARN: Record<string, string> = Object.fromEntries(Object.entries(files).map(([path, text]) => [path.split('/').pop()!.replace(/\.md$/, ''), text]));
