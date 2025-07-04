import React from 'react';
import styles from './Pagination.module.css';

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <span className={styles.paginationInfo}>
        Página {currentPage} de {totalPages}
      </span>
      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}; 