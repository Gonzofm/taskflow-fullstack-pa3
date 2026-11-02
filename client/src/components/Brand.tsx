import { ArrowRight } from 'lucide-react';
export function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark" aria-hidden="true"><i /><i /><i /><ArrowRight size={17} /></span><span>taskflow<span className="brand-dot">.</span></span></div>;
}
