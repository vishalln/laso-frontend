export const DATE_FORMATS = {
  LOCALE: "en-IN",
  DATE: { year: "numeric", month: "short", day: "numeric" } as const,
  DATETIME: { 
    year: "numeric", 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  } as const,
  TIME: { hour: "2-digit", minute: "2-digit" } as const,
} as const;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DATE_FORMATS.LOCALE, DATE_FORMATS.DATE);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(DATE_FORMATS.LOCALE, DATE_FORMATS.DATETIME);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(DATE_FORMATS.LOCALE, DATE_FORMATS.TIME);
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(iso);
}
