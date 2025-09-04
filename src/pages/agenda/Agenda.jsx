import React, { useEffect, useMemo, useState } from "react"
import styles from "./agenda.module.css"
import { agendaService } from "../../services/agendaService"
import { useNotification } from "../../contexts/NotificationContext"
import { RemitoSelectModal } from "../../components/RemitoSelectModal"

// Utilidades de fecha
const pad2 = (n) => `${n}`.padStart(2, "0")
const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const buildMonthMatrix = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1)
  const startDay = (first.getDay() + 6) % 7 // Lunes=0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function Agenda() {
  const today = useMemo(() => new Date(), [])
  const [cursorDate, setCursorDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(today))
  const [monthData, setMonthData] = useState({}) // { 'YYYY-MM-DD': Remito[] }
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()
  const [view, setView] = useState('month') // 'month' | 'week' | 'day'

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('assign') // 'assign' | 'remove'
  
  // Estado para rastrear remitos agendados y evitar duplicados
  const [remitosAgendados, setRemitosAgendados] = useState(new Set())

  const year = cursorDate.getFullYear()
  const monthIndex = cursorDate.getMonth()
  const monthLabel = cursorDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })

  // Cargar grilla mensual usando fechaAgenda
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones en componentes desmontados
    
    const load = async () => {
      try {
        setLoading(true)
        const grid = await agendaService.getMonthGrid({ year, month: monthIndex + 1 })
        
        if (!isMounted) return; // Evitar actualizaciones si el componente se desmontó
        
        const map = {}
        const agendadosIds = new Set()
        
        grid.forEach((d) => {
          map[d.date] = d.remitos
          // Agregar IDs de remitos agendados al Set
          d.remitos.forEach(remito => agendadosIds.add(remito.id))
        })
        
        setMonthData(map)
        setRemitosAgendados(agendadosIds)
        
        console.log('📅 Cargada agenda del mes:', Object.keys(map).length, 'días con remitos')
        console.log('📊 Total remitos agendados:', agendadosIds.size)
      } catch (e) {
        if (isMounted) {
          showNotification("Error cargando agenda", "error")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    load()
    
    // Cleanup function
    return () => {
      isMounted = false;
    }
  }, [year, monthIndex, showNotification])

  const cells = useMemo(() => buildMonthMatrix(year, monthIndex), [year, monthIndex])
  const selectedRemitos = monthData[selectedDate] || []
  
  // Debug: Solo mostrar cuando hay cambios importantes
  React.useEffect(() => {
    if (selectedRemitos.length > 0) {
      console.log('📅 Agenda - Día seleccionado:', selectedDate, 'Remitos:', selectedRemitos.length)
      console.log('📊 Detalle remitos del día:', selectedRemitos.map(r => ({ 
        id: r.id, 
        numero: r.numeroAsignado, 
        fechaAgenda: r.fechaAgenda,
        esDemo: r.numeroAsignado.includes('REM-2025') || r.numeroAsignado.includes('REM-DISP')
      })))
    }
  }, [selectedDate, selectedRemitos.length])

  const goPrev = () => setCursorDate(new Date(year, monthIndex - 1, 1))
  const goNext = () => setCursorDate(new Date(year, monthIndex + 1, 1))
  const goToday = () => {
    const d = new Date()
    setCursorDate(new Date(d.getFullYear(), d.getMonth(), 1))
    setSelectedDate(toIsoDate(d))
  }

  // Solo modificar fechaAgenda desde Agenda
  const handleAssign = async (remito) => {
    try {
      // Verificar si el remito ya está agendado
      if (remitosAgendados.has(remito.id)) {
        showNotification("Este remito ya está agendado", "warning")
        return
      }
      
      // Agendar el remito
      const remitoAgendado = await agendaService.assignRemitoToDate(remito.id, selectedDate)
      showNotification("Remito agendado", "success")
      
      // Actualizar el remito con la fechaAgenda
      const remitoActualizado = { ...remito, fechaAgenda: selectedDate }
      
      // Actualizar el estado de remitos agendados
      setRemitosAgendados(prev => new Set([...prev, remito.id]))
      
      // Actualizar los datos del mes
      setMonthData((prev) => {
        const newData = { ...prev }
        if (!newData[selectedDate]) {
          newData[selectedDate] = []
        }
        // Agregar el remito a la fecha seleccionada
        newData[selectedDate] = [...newData[selectedDate], remitoActualizado]
        return newData
      })
      
      console.log('✅ Remito agendado:', remitoActualizado.numeroAsignado, 'para', selectedDate)
      console.log('📊 Remitos agendados total:', remitosAgendados.size + 1)
    } catch (e) {
      console.error('❌ Error agendando remito:', e)
      showNotification("No se pudo agendar", "error")
    }
  }

  const handleRemove = async (remito) => {
    try {
      // Quitar el remito de la agenda
      await agendaService.removeRemitoDate(remito.id)
      showNotification("Remito quitado", "success")
      
      // Actualizar el estado de remitos agendados
      setRemitosAgendados(prev => {
        const newSet = new Set(prev)
        newSet.delete(remito.id)
        return newSet
      })
      
      // Actualizar los datos del mes removiendo el remito
      setMonthData((prev) => {
        const newData = { ...prev }
        if (newData[selectedDate]) {
          newData[selectedDate] = newData[selectedDate].filter(r => r.id !== remito.id)
        }
        return newData
      })
      
      console.log('✅ Remito quitado:', remito.numeroAsignado, 'de', selectedDate)
      console.log('📊 Remitos agendados total:', remitosAgendados.size - 1)
    } catch (e) {
      console.error('❌ Error quitando remito:', e)
      showNotification("No se pudo quitar", "error")
    }
  }

  const openAssignModal = () => { setModalMode('assign'); setModalOpen(true); }
  const openRemoveModal = () => { setModalMode('remove'); setModalOpen(true); }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Agenda</h1>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.navButton} onClick={goPrev}>Anterior</button>
            <button className={styles.navButton} onClick={goToday}>Hoy</button>
            <button className={styles.navButton} onClick={goNext}>Siguiente</button>
          </div>
          <div className={styles.monthLabel}>{monthLabel}</div>
          <div className={styles.viewSwitch}>
            <button className={`${styles.viewButton} ${view==='month'?styles.viewActive:''}`} onClick={()=>setView('month')}>Mes</button>
            <button className={`${styles.viewButton} ${view==='week'?styles.viewActive:''}`} onClick={()=>setView('week')}>Semana</button>
            <button className={`${styles.viewButton} ${view==='day'?styles.viewActive:''}`} onClick={()=>setView('day')}>Día</button>
          </div>
        </div>

        {/* Vista actual (por ahora, mostramos el grid mensual en todas hasta definir semana/día) */}
        <div className={styles.calendar}>
          <div className={styles.weekHeader}>
            <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
          </div>
          <div className={styles.grid}>
            {cells.map((dateObj, idx) => {
              const isEmpty = !dateObj
              const iso = isEmpty ? null : toIsoDate(dateObj)
              const isSelected = iso === selectedDate
              // Solo mostrar punto si hay remitos REALMENTE agendados para esa fecha
              const remitosDelDia = iso ? (monthData[iso] || []) : []
              const count = remitosDelDia.length
              const hasRemitos = count > 0
              
              return (
                <div
                  key={idx}
                  className={`${styles.cell} ${isEmpty ? styles.cellEmpty : ""} ${isSelected ? styles.cellSelected : ""}`}
                  onClick={() => iso && setSelectedDate(iso)}
                >
                  {!isEmpty && (
                    <>
                      <div className={styles.cellDay}>{dateObj.getDate()}</div>
                      {hasRemitos && <div className={styles.dot} />}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>
            {new Date(selectedDate).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
            {loading && <span style={{ color: '#ef4444', fontSize: '0.8em', marginLeft: '10px' }}>🔄 Cargando...</span>}
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Remito</th>
                  <th>Cliente</th>
                  <th>Destino</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {selectedRemitos.map((r) => (
                  <tr key={r.id}>
                    <td>{r.numeroAsignado}</td>
                    <td>{r.cliente?.razonSocial || "-"}</td>
                    <td>{r.destino?.nombre || "-"}</td>
                    <td>{r.prioridad}</td>
                  </tr>
                ))}
                {selectedRemitos.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyRow}>No hay remitos agendados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={openAssignModal}>Agendar</button>
            <button className={styles.secondaryButton} onClick={openRemoveModal}>Quitar</button>
          </div>
        </div>
      </div>

      <RemitoSelectModal
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        onSelect={modalMode==='assign' ? handleAssign : handleRemove}
        mode={modalMode}
        remitosAgendados={remitosAgendados}
      />
    </div>
  )
}
