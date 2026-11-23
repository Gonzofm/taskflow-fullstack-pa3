import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { imageUrl } from '../services/catalog';

export function ResourceImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className={`tf-image-error ${className}`} role="img" aria-label={`Imagen no disponible: ${alt}`}><ImageOff size={28} /><span>Imagen no disponible</span></span> : <img className={className} src={imageUrl(src)} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}
