import React, { useEffect, useMemo, useState } from "react"
import styles from "./agenda.module.css"
import { agendaService } from "../../services/agendaService"
import { useNotification } from "../../contexts/NotificationContext"
import { RemitoSelectModal } from "../../components/RemitoSelectModal"
import { CronConfigModal } from "../../components/CronConfigModal/CronConfigModal"
import { Settings } from "lucide-react"

// Utilidades de fecha
const pad2 = (n) => `${n}`.padStart(2, "0")
const toIsoDate = (d) => {
  // Usar UTC para consistencia con el backend
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  return `${year}-${pad2(month)}-${pad2(day)}`
}

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
  const [selectedDate, setSelectedDate] = useState(() => {
    // Usar UTC para consistencia con el backend
    const now = new Date()
    return toIsoDate(now)
  })
  const [monthData, setMonthData] = useState({}) // { 'YYYY-MM-DD': Remito[] }
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()
  const [view, setView] = useState('month') // 'month' | 'week' | 'day'

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('assign') // 'assign' | 'remove'
  
  // Estado para rastrear remitos agendados y evitar duplicados
  const [remitosAgendados, setRemitosAgendados] = useState(new Set())

  // Estado para el modal de configuración del cron
  const [cronConfigModalOpen, setCronConfigModalOpen] = useState(false)

  const year = cursorDate.getFullYear()
  const monthIndex = cursorDate.getMonth()
  const monthLabel = cursorDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" })

  // Función para refrescar los datos del mes
  const refreshMonthData = async () => {
    try {
      setLoading(true)
      console.log('🔍 DEBUG - refreshMonthData - Iniciando refresh...')
      console.log('🔍 DEBUG - refreshMonthData - Datos locales ANTES del refresh:', monthData)
      
      const grid = await agendaService.getMonthGrid({ year, month: monthIndex + 1 })
      console.log('🔍 DEBUG - refreshMonthData - Grid del backend:', grid)
      
      // Verificar si el backend tiene datos de fechaAgenda
      const hasBackendData = Object.values(grid).some(remitos => 
        Array.isArray(remitos) && remitos.some(remito => remito.fechaAgenda)
      )
      
      console.log('🔍 DEBUG - refreshMonthData - ¿Backend tiene datos de fechaAgenda?', hasBackendData)
      
      if (hasBackendData) {
        // Si el backend tiene datos correctos, usarlos
        console.log('✅ Usando datos del backend')
        setMonthData(grid)
        const agendados = new Set()
        Object.values(grid).forEach(remitos => {
          remitos.forEach(remito => {
            if (remito.fechaAgenda) {
              agendados.add(remito.id)
            }
          })
        })
        setRemitosAgendados(agendados)
        console.log('🔍 DEBUG - refreshMonthData - Agendados del backend:', agendados)
      } else {
        // Si el backend no tiene datos correctos, mantener los datos locales
        console.log('⚠️ Backend no tiene datos de fechaAgenda, manteniendo datos locales')
        console.log('🔍 DEBUG - refreshMonthData - Datos locales que se mantienen:', monthData)
        // No actualizar monthData ni remitosAgendados
      }
    } catch (e) {
      console.error('Error refrescando datos:', e)
      showNotification("Error al cargar datos", "error")
    } finally {
      setLoading(false)
    }
  }

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
        
        console.log('🔍 DEBUG - Carga inicial - Grid del backend:', grid)
        
        grid.forEach((d) => {
          map[d.date] = d.remitos
          console.log(`🔍 DEBUG - Carga inicial - Día ${d.date}:`, d.remitos)
          
          // Solo agregar IDs de remitos que realmente tienen fechaAgenda
          d.remitos.forEach(remito => {
            console.log(`🔍 DEBUG - Carga inicial - Remito ${remito.id}:`, {
              numeroAsignado: remito.numeroAsignado,
              fechaAgenda: remito.fechaAgenda,
              tipoFechaAgenda: typeof remito.fechaAgenda
            })
            if (remito.fechaAgenda) {
              agendadosIds.add(remito.id)
            }
          })
        })
        
        setMonthData(map)
        setRemitosAgendados(agendadosIds)
        
        console.log('📅 Cargada agenda del mes:', Object.keys(map).length, 'días con remitos')
        console.log('📊 Total remitos agendados:', agendadosIds.size)
        console.log('🔍 DEBUG - Carga inicial - Map final:', map)
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
    // Usar UTC para consistencia con el backend
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
      
      console.log('🔍 DEBUG - handleAssign - Remito:', remito);
      console.log('🔍 DEBUG - handleAssign - Fecha seleccionada:', selectedDate);
      console.log('🔍 DEBUG - handleAssign - Tipo de fecha:', typeof selectedDate);
      console.log('🔍 DEBUG - handleAssign - Fecha parseada:', new Date(selectedDate));
      console.log('🔍 DEBUG - handleAssign - Fecha local:', new Date(selectedDate).toLocaleDateString());
      
      // Agendar el remito
      const remitoAgendado = await agendaService.assignRemitoToDate(remito.id, selectedDate)
      showNotification("Remito agendado", "success")
      
      // Actualizar el remito con la fechaAgenda (usar la fecha seleccionada directamente)
      const remitoActualizado = { ...remito, fechaAgenda: selectedDate }
      console.log('🔍 DEBUG - handleAssign - Remito actualizado:', remitoActualizado)
      console.log('🔍 DEBUG - handleAssign - Fecha que se guarda:', selectedDate)
      
      // Actualizar el estado de remitos agendados
      setRemitosAgendados(prev => {
        const newSet = new Set([...prev, remito.id])
        console.log('🔍 DEBUG - handleAssign - Nuevo set de agendados:', newSet)
        return newSet
      })
      
      // Actualizar los datos del mes
      setMonthData((prev) => {
        console.log('🔍 DEBUG - handleAssign - monthData ANTES:', prev)
        const newData = { ...prev }
        if (!newData[selectedDate]) {
          newData[selectedDate] = []
        }
        // Agregar el remito a la fecha seleccionada
        newData[selectedDate] = [...newData[selectedDate], remitoActualizado]
        console.log('🔍 DEBUG - handleAssign - monthData DESPUÉS:', newData)
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
  const openCronConfigModal = () => { setCronConfigModalOpen(true); }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Agenda</h1>
        <button 
          className={styles.configButton} 
          onClick={openCronConfigModal}
          title="Configurar horario de notificaciones"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
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
            {(() => {
              // Parsear la fecha usando UTC para consistencia
              const [year, month, day] = selectedDate.split('-').map(Number)
              const date = new Date(Date.UTC(year, month - 1, day))
              return date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
            })()}
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
        selectedDate={selectedDate}
        remitosDelDia={selectedRemitos}
      />

      <CronConfigModal
        open={cronConfigModalOpen}
        onClose={()=>setCronConfigModalOpen(false)}
      />
    </div>
  )
}
