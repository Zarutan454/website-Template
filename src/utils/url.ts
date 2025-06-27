import { config } from '@/config/env';

export function getFullUrl(path?: string | null): string {
  if (!path) {
    return '';
  }
  // Wenn der Pfad bereits eine vollständige URL ist, gib ihn unverändert zurück
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Kombiniere die Backend-URL mit dem relativen Pfad
  return `${config.django_api_url}${path}`;
} 
