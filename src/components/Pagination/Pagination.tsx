import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Asegurar que totalPages sea al menos 1 y que currentPage no exceda totalPages
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(currentPage, safeTotalPages);
  
  const startItem = totalItems > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    // Si no hay páginas o solo hay una página, no mostrar paginación
    if (safeTotalPages <= 1) {
      return [];
    }
    
    if (safeTotalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si hay 5 o menos
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (safeCurrentPage <= 3) {
        // Estamos cerca del inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        // Estamos cerca del final
        pages.push(1);
        pages.push('...');
        for (let i = safeTotalPages - 3; i <= safeTotalPages; i++) {
          pages.push(i);
        }
      } else {
        // Estamos en el medio
        pages.push(1);
        pages.push('...');
        for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(safeTotalPages);
      }
    }
    return pages;
  };

  // No mostrar paginación si no hay elementos o solo hay una página
  if (totalItems === 0 || safeTotalPages <= 1) return null;

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        {totalItems > 0 ? `Mostrando ${startItem}-${endItem} de ${totalItems} elementos` : 'No hay elementos'}
      </div>
      <div className={styles.paginationControls}>
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className={`${styles.paginationButton} ${styles.navButton}`}
          title="Página anterior"
        >
          <ChevronLeft size={20} />
        </button>
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={styles.ellipsis}>...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`${styles.paginationButton} ${safeCurrentPage === page ? styles.activePage : ''}`}
                style={{ minWidth: 40 }}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className={`${styles.paginationButton} ${styles.navButton}`}
          title="Página siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

