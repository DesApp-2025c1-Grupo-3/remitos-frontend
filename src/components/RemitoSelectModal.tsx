import React from 'react';
import { Pagination } from './Pagination/Pagination';
import { X } from 'lucide-react';
import { remitosService, Remito } from '../services/remitosService';

interface RemitoSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (remito: Remito) => void;
  mode: 'assign' | 'remove';
}

export const RemitoSelectModal: React.FC<RemitoSelectModalProps> = ({ open, onClose, onSelect, mode }) => {
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [items, setItems] = React.useState<{ data: Remito[]; totalItems: number; totalPages: number; currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = React.useState(false);
  const itemsPerPage = 8;

  const debouncedSearch = React.useMemo(() => search, [search]);

  const load = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const filters: any = {};
      if (debouncedSearch.trim()) filters.numeroAsignado = debouncedSearch.trim();
      if (mode === 'assign') {
        // Mostrar remitos no agendados
        filters.fechaAgenda = '';
      }
      const data = await remitosService.getRemitos(currentPage, itemsPerPage, filters);
      setItems(data);
    } catch (e) {
      setItems({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  }, [open, debouncedSearch, currentPage, mode]);

  React.useEffect(() => { if (open) load(); }, [open, debouncedSearch, currentPage, mode]);
  React.useEffect(() => { if (open) setCurrentPage(1); }, [debouncedSearch, mode, open]);

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#fff', borderRadius:'12px', width:'100%', maxWidth:'640px', height:'600px', maxHeight:'90vh', boxShadow:'0 8px 32px #0002', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'0.7rem 1rem 0.5rem 1rem', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
          <h3 style={{ fontSize:'1.05rem', fontWeight:600, margin:0, color:'#374151' }}>
            {mode === 'assign' ? 'Agregar remito a la agenda' : 'Quitar remito de la agenda'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar" style={{ background:'none', border:'none', color:'#6b7280', fontSize:18, cursor:'pointer', padding:2, borderRadius:'50%', position:'absolute', right:8, top:8 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #f3f4f6', display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por número de remito..." style={{ flex:1, padding:'0.25rem 0.6rem', borderRadius:6, border:'1px solid #d1d5db', fontSize:'0.85rem', background:'#f9fafb', color:'#374151', height:'1.7rem' }} />
        </div>

        <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {loading ? (
            <div style={{ padding:'2rem', textAlign:'center', color:'#6b7280', fontSize:'0.875rem' }}>Cargando remitos...</div>
          ) : items.data && items.data.length > 0 ? (
            <>
              <div style={{ flex:1, overflow:'auto', padding:'0.5rem' }}>
                {items.data.map(r => (
                  <div key={r.id} onClick={()=>{ onSelect(r); onClose(); }} style={{ padding:'0.5rem 0.75rem', border:'1px solid #e5e7eb', marginBottom:'0.25rem', cursor:'pointer', borderRadius:'6px', background:'#fff', transition:'all 0.2s ease', fontSize:'0.92em', lineHeight:1.2 }}
                    onMouseEnter={(e)=>{ e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor = '#1F7A3D'; }}
                    onMouseLeave={(e)=>{ e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <div style={{ fontWeight:600, color:'#374151', marginBottom:'0.1rem' }}>{r.numeroAsignado}</div>
                    <div style={{ fontSize:'0.85em', color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {r.cliente?.razonSocial || 'Sin cliente'} — {r.destino?.nombre || 'Sin destino'} — {r.prioridad}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'0.8rem 1rem', borderTop:'1px solid #f3f4f6', display:'flex', flexDirection:'column', alignItems:'center', background:'#fff' }}>
                <Pagination currentPage={items.currentPage} totalPages={items.totalPages} onPageChange={setCurrentPage} totalItems={items.totalItems} itemsPerPage={itemsPerPage} />
              </div>
            </>
          ) : (
            <div style={{ padding:'2rem', textAlign:'center', color:'#6b7280', fontSize:'0.875rem' }}>No se encontraron remitos</div>
          )}
        </div>
      </div>
    </div>
  );
};
