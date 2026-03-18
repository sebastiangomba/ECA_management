import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ViewId = 'dashboard' | 'recepcion' | 'inventario' | 'reportes' | 'historial'

type MaterialType = {
  code: string
  name: string
  unit: string
}

type RouteItem = {
  id: string
  name: string
  zone: string
}

type Recycler = {
  id: string
  name: string
  document: string
}

type Transaction = {
  id: string
  recyclerId: string
  recyclerName: string
  routeId: string
  routeName: string
  materialCode: string
  materialName: string
  weight: number
  rejection: number
  timestamp: string
}

type InventoryItem = {
  code: string
  name: string
  stock: number
  unit: string
  status: 'critical' | 'low' | 'medium' | 'high'
  lastUpdate: string
}

type Notice = {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

const storageKey = 'eca-management-transactions'

const materialTypes: MaterialType[] = [
  { code: 'PET-01', name: 'PET (Botellas Plásticas)', unit: 'kg' },
  { code: 'CART-01', name: 'Cartón', unit: 'kg' },
  { code: 'PAP-01', name: 'Papel de Archivo', unit: 'kg' },
  { code: 'SOPL-01', name: 'Soplado', unit: 'kg' },
  { code: 'HDPE-01', name: 'HDPE (Plástico Duro)', unit: 'kg' },
  { code: 'LDPE-01', name: 'LDPE (Bolsas Plásticas)', unit: 'kg' },
  { code: 'ALU-01', name: 'Aluminio (Latas)', unit: 'kg' },
  { code: 'VIDR-01', name: 'Vidrio', unit: 'kg' },
]

const routes: RouteItem[] = [
  { id: '1', name: 'Ruta 1 - Centro', zone: 'Centro' },
  { id: '2', name: 'Ruta 2 - Norte', zone: 'Norte' },
  { id: '3', name: 'Ruta 3 - Sur', zone: 'Sur' },
  { id: '4', name: 'Ruta 4 - Oriental', zone: 'Oriental' },
  { id: '5', name: 'Ruta 5 - Occidental', zone: 'Occidental' },
]

const recyclers: Recycler[] = [
  { id: '1', name: 'Juan Carlos Pérez', document: '1234567890' },
  { id: '2', name: 'María Elena Gómez', document: '0987654321' },
  { id: '3', name: 'Pedro Antonio Martínez', document: '1122334455' },
  { id: '4', name: 'Ana Lucía Rodríguez', document: '5566778899' },
  { id: '5', name: 'Luis Fernando Castro', document: '9988776655' },
]

const balanceData = [
  { material: 'PET', ingresado: 450, rechazos: 35, aprovechado: 415 },
  { material: 'Cartón', ingresado: 380, rechazos: 25, aprovechado: 355 },
  { material: 'Papel', ingresado: 280, rechazos: 20, aprovechado: 260 },
  { material: 'Soplado', ingresado: 210, rechazos: 18, aprovechado: 192 },
  { material: 'HDPE', ingresado: 165, rechazos: 12, aprovechado: 153 },
  { material: 'LDPE', ingresado: 145, rechazos: 15, aprovechado: 130 },
  { material: 'Aluminio', ingresado: 95, rechazos: 5, aprovechado: 90 },
  { material: 'Vidrio', ingresado: 220, rechazos: 18, aprovechado: 202 },
]

const recyclerPayments = [
  { name: 'Juan Carlos Pérez', tons: 2.45, payments: 850000, efficiency: 94 },
  { name: 'María Elena Gómez', tons: 3.2, payments: 1120000, efficiency: 96 },
  { name: 'Pedro Antonio Martínez', tons: 1.89, payments: 661500, efficiency: 92 },
  { name: 'Ana Lucía Rodríguez', tons: 2.78, payments: 973000, efficiency: 95 },
  { name: 'Luis Fernando Castro', tons: 0.98, payments: 343000, efficiency: 88 },
]

const massBalanceData = [
  { month: 'Ene', entrada: 4500, salida: 4200, rechazo: 300 },
  { month: 'Feb', entrada: 5200, salida: 4800, rechazo: 400 },
  { month: 'Mar', entrada: 4800, salida: 4500, rechazo: 300 },
  { month: 'Abr', entrada: 5500, salida: 5100, rechazo: 400 },
  { month: 'May', entrada: 6000, salida: 5600, rechazo: 400 },
  { month: 'Jun', entrada: 5800, salida: 5400, rechazo: 400 },
]

const inventoryData: InventoryItem[] = [
  { code: 'PET-01', name: 'PET (Botellas Plásticas)', stock: 1250, unit: 'kg', status: 'high', lastUpdate: 'Hace 2 horas' },
  { code: 'CART-01', name: 'Cartón', stock: 850, unit: 'kg', status: 'medium', lastUpdate: 'Hace 5 horas' },
  { code: 'PAP-01', name: 'Papel de Archivo', stock: 320, unit: 'kg', status: 'low', lastUpdate: 'Hace 1 hora' },
  { code: 'SOPL-01', name: 'Soplado', stock: 560, unit: 'kg', status: 'medium', lastUpdate: 'Hace 3 horas' },
  { code: 'HDPE-01', name: 'HDPE (Plástico Duro)', stock: 420, unit: 'kg', status: 'medium', lastUpdate: 'Hace 4 horas' },
  { code: 'LDPE-01', name: 'LDPE (Bolsas Plásticas)', stock: 180, unit: 'kg', status: 'low', lastUpdate: 'Hace 6 horas' },
  { code: 'ALU-01', name: 'Aluminio (Latas)', stock: 95, unit: 'kg', status: 'critical', lastUpdate: 'Hace 8 horas' },
  { code: 'VIDR-01', name: 'Vidrio', stock: 740, unit: 'kg', status: 'medium', lastUpdate: 'Hace 2 horas' },
]

const navigation: { id: ViewId; name: string; icon: IconName }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
  { id: 'recepcion', name: 'Recepción', icon: 'scale' },
  { id: 'inventario', name: 'Inventario', icon: 'package' },
  { id: 'reportes', name: 'Centro de Reportes', icon: 'report' },
  { id: 'historial', name: 'Historial', icon: 'history' },
]

type IconName =
  | 'dashboard'
  | 'scale'
  | 'package'
  | 'report'
  | 'history'
  | 'wifi'
  | 'wifiOff'
  | 'message'
  | 'search'
  | 'filter'
  | 'calendar'
  | 'user'
  | 'location'
  | 'warning'
  | 'download'
  | 'printer'
  | 'send'
  | 'check'
  | 'refresh'
  | 'truck'
  | 'trendUp'
  | 'trendDown'
  | 'bar'

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const icons: Record<IconName, string> = {
    dashboard: 'M4 13h7V4H4zm9 7h7V4h-7zm-9 0h7v-5H4z',
    scale: 'M12 3v3m-7 4h14M7 10l-3 6h6zm10 0l-3 6h6zM8 20h8',
    package: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zm0 0v18m8-13.5l-8 4.5-8-4.5',
    report: 'M5 19V5h14v14M9 15v-3m4 3V9m4 6V7',
    history: 'M4 12a8 8 0 101.9-5.2M4 4v5h5',
    wifi: 'M4.9 9A12 12 0 0119 9M8.5 12.5a6.7 6.7 0 017 0M12 18h.01',
    wifiOff: 'M3 3l18 18M8.5 12.5a6.7 6.7 0 012.1-.9m4.9.9a6.7 6.7 0 00-1.6-.8M4.9 9A12 12 0 0112 6c1.9 0 3.7.4 5.2 1.1',
    message: 'M5 6h14v10H8l-3 3z',
    search: 'M11 5a6 6 0 100 12 6 6 0 000-12zm8 14l-3.5-3.5',
    filter: 'M4 6h16M7 12h10M10 18h4',
    calendar: 'M7 3v4m10-4v4M4 9h16v11H4z',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
    location: 'M12 21s6-5.3 6-11a6 6 0 10-12 0c0 5.7 6 11 6 11z',
    warning: 'M12 4l9 16H3zm0 5v4m0 4h.01',
    download: 'M12 4v10m0 0l-4-4m4 4l4-4M5 20h14',
    printer: 'M7 8V4h10v4M6 17H4v-6h16v6h-2m-10 0h8v3H8z',
    send: 'M21 3L3 11l7 2 2 7z',
    check: 'M5 13l4 4L19 7',
    refresh: 'M20 5v6h-6M4 19v-6h6M6.5 8A7 7 0 0118 6m-12 12a7 7 0 0011.5 2',
    truck: 'M3 7h11v8H3zm11 3h4l3 3v2h-7M7 18a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z',
    trendUp: 'M4 16l6-6 4 4 6-8M20 6v4h-4',
    trendDown: 'M4 8l6 6 4-4 6 8M20 18v-4h-4',
    bar: 'M5 19V9m7 10V5m7 14v-7',
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={icons[name]} />
    </svg>
  )
}

function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([])

  const pushNotice = (type: Notice['type'], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setNotices((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id))
    }, 3200)
  }

  return { notices, pushNotice }
}

function formatNumber(value: number) {
  return value.toLocaleString('es-CO')
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const content = rows.map((row) => row.join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [scaleActive] = useState(true)
  const [selectedRecycler, setSelectedRecycler] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [weight, setWeight] = useState('')
  const [rejection, setRejection] = useState('')
  const [simulatedWeight, setSimulatedWeight] = useState(0)
  const [isWeighing, setIsWeighing] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryStatus, setInventoryStatus] = useState('all')
  const [historySearch, setHistorySearch] = useState('')
  const [historyMaterial, setHistoryMaterial] = useState('all')
  const [historyDate, setHistoryDate] = useState('all')
  const [reportPeriod, setReportPeriod] = useState('monthly')
  const [printPreview, setPrintPreview] = useState(false)
  const { notices, pushNotice } = useNotices()

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        setTransactions(JSON.parse(stored))
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(transactions))
  }, [transactions])

  const filteredInventory = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.code.toLowerCase().includes(inventorySearch.toLowerCase())
      const matchesStatus = inventoryStatus === 'all' || item.status === inventoryStatus
      return matchesSearch && matchesStatus
    })
  }, [inventorySearch, inventoryStatus])

  const filteredTransactions = useMemo(() => {
    const now = new Date()
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.recyclerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        transaction.id.toLowerCase().includes(historySearch.toLowerCase())
      const matchesMaterial = historyMaterial === 'all' || transaction.materialCode === historyMaterial

      if (!matchesSearch || !matchesMaterial) {
        return false
      }

      if (historyDate === 'all') {
        return true
      }

      const parsedDate = new Date(transaction.timestamp)
      if (Number.isNaN(parsedDate.getTime())) {
        return true
      }

      const diff = now.getTime() - parsedDate.getTime()
      const diffDays = diff / (1000 * 60 * 60 * 24)

      if (historyDate === 'today') {
        return parsedDate.toDateString() === now.toDateString()
      }
      if (historyDate === 'week') {
        return diffDays <= 7
      }
      if (historyDate === 'month') {
        return diffDays <= 31
      }
      return true
    })
  }, [historyDate, historyMaterial, historySearch, transactions])

  const inventoryTotals = useMemo(() => {
    const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0)
    const criticalItems = inventoryData.filter((item) => item.status === 'critical' || item.status === 'low').length
    return { totalStock, criticalItems }
  }, [])

  const historyTotals = useMemo(() => {
    const totalWeight = filteredTransactions.reduce((sum, item) => sum + item.weight, 0)
    const totalRejection = filteredTransactions.reduce((sum, item) => sum + item.rejection, 0)
    return {
      totalWeight,
      totalRejection,
      netWeight: totalWeight - totalRejection,
    }
  }, [filteredTransactions])

  const dashboardStats = useMemo(() => {
    const totalIncoming = massBalanceData.reduce((sum, item) => sum + item.entrada, 0)
    const totalOutgoing = massBalanceData.reduce((sum, item) => sum + item.salida, 0)
    const totalRejection = massBalanceData.reduce((sum, item) => sum + item.rechazo, 0)
    const activeRecyclers = recyclers.length + 40
    return {
      totalIncoming,
      totalOutgoing,
      totalRejection,
      rejectionPercentage: ((totalRejection / totalIncoming) * 100).toFixed(1),
      activeRecyclers,
      todayTransactions: transactions.length,
    }
  }, [transactions.length])

  const reportTotals = useMemo(() => {
    const totalIngresado = balanceData.reduce((sum, item) => sum + item.ingresado, 0)
    const totalRechazos = balanceData.reduce((sum, item) => sum + item.rechazos, 0)
    const totalAprovechado = balanceData.reduce((sum, item) => sum + item.aprovechado, 0)
    return {
      totalIngresado,
      totalRechazos,
      totalAprovechado,
      rejectionPercent: ((totalRechazos / totalIngresado) * 100).toFixed(1),
    }
  }, [])

  const simulateScale = () => {
    setIsWeighing(true)
    let counter = 0
    const interval = window.setInterval(() => {
      const randomWeight = Math.floor(Math.random() * 50) + 10
      setSimulatedWeight(randomWeight)
      counter += 1
      if (counter > 10) {
        window.clearInterval(interval)
        setIsWeighing(false)
        setWeight(randomWeight.toString())
      }
    }, 100)
  }

  const resetReceptionForm = () => {
    setSelectedRecycler('')
    setSelectedRoute('')
    setSelectedMaterial('')
    setWeight('')
    setRejection('')
    setSimulatedWeight(0)
    setCurrentTransaction(null)
    setReceiptOpen(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedRecycler || !selectedRoute || !selectedMaterial || !weight) {
      pushNotice('error', 'Por favor complete todos los campos obligatorios.')
      return
    }

    const weightNum = Number.parseFloat(weight)
    const rejectionNum = Number.parseFloat(rejection || '0')

    if (weightNum <= 0) {
      pushNotice('error', 'El peso debe ser mayor a cero.')
      return
    }

    if (rejectionNum < 0 || rejectionNum > weightNum) {
      pushNotice('error', 'El rechazo no puede ser negativo ni mayor al peso total.')
      return
    }

    const recycler = recyclers.find((item) => item.id === selectedRecycler)
    const route = routes.find((item) => item.id === selectedRoute)
    const material = materialTypes.find((item) => item.code === selectedMaterial)

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      recyclerId: selectedRecycler,
      recyclerName: recycler?.name ?? '',
      routeId: selectedRoute,
      routeName: route?.name ?? '',
      materialCode: selectedMaterial,
      materialName: material?.name ?? '',
      weight: weightNum,
      rejection: rejectionNum,
      timestamp: new Date().toISOString(),
    }

    setTransactions((current) => [transaction, ...current])
    setCurrentTransaction(transaction)
    setReceiptOpen(true)
    pushNotice('success', 'Transacción registrada exitosamente.')
  }

  const exportSui = () => {
    downloadCsv(
      `reporte_SUI_${new Date().toISOString().split('T')[0]}.csv`,
      [
        ['Código Material', 'Material', 'Ingresado (kg)', 'Rechazos (kg)', 'Aprovechado (kg)', '% Rechazo'],
        ...balanceData.map((item) => [
          item.material,
          item.material,
          item.ingresado,
          item.rechazos,
          item.aprovechado,
          ((item.rechazos / item.ingresado) * 100).toFixed(2),
        ]),
      ],
    )
    pushNotice('success', 'Archivo SUI generado exitosamente.')
  }

  const exportPayments = () => {
    downloadCsv(
      `resumen_pagos_${new Date().toISOString().split('T')[0]}.csv`,
      [['Reciclador', 'Toneladas', 'Pago (COP)', 'Eficiencia (%)'], ...recyclerPayments.map((item) => [item.name, item.tons, item.payments, item.efficiency])],
    )
    pushNotice('success', 'Resumen de pagos exportado.')
  }

  const exportTransactions = () => {
    downloadCsv(
      `transacciones_${new Date().toISOString().split('T')[0]}.csv`,
      [
        ['ID', 'Fecha', 'Reciclador', 'Ruta', 'Material', 'Peso (kg)', 'Rechazo (kg)', 'Neto (kg)'],
        ...filteredTransactions.map((item) => [
          item.id,
          new Date(item.timestamp).toLocaleString('es-CO'),
          item.recyclerName,
          item.routeName,
          item.materialName,
          item.weight,
          item.rejection,
          item.weight - item.rejection,
        ]),
      ],
    )
    pushNotice('success', 'CSV de transacciones exportado.')
  }

  const statusLabel: Record<InventoryItem['status'], string> = {
    critical: 'Crítico',
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
  }

  const renderDashboard = () => (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Dashboard de Gestión</h1>
          <p>Monitoreo en tiempo real de operaciones ECA</p>
        </div>
      </header>

      <div className="stats-grid four">
        <MetricCard
          title="Balance de Masa"
          value={`${formatNumber(dashboardStats.totalOutgoing)} kg`}
          detail={`De ${formatNumber(dashboardStats.totalIncoming)} kg ingresados`}
          trend="+12.5% este mes"
          trendType="up"
          icon="scale"
        />
        <MetricCard
          title="% Rechazo"
          value={`${dashboardStats.rejectionPercentage}%`}
          detail={`${formatNumber(dashboardStats.totalRejection)} kg rechazados`}
          trend="-2.1% vs mes anterior"
          trendType="down"
          icon="warning"
        />
        <MetricCard
          title="Recicladores Activos"
          value={String(dashboardStats.activeRecyclers)}
          detail="En las últimas 24 horas"
          trend="+3 nuevos este mes"
          trendType="up"
          icon="user"
        />
        <MetricCard
          title="Transacciones Hoy"
          value={String(dashboardStats.todayTransactions)}
          detail="Última hace 15 minutos"
          trend="320 kg procesados hoy"
          trendType="neutral"
          icon="truck"
        />
      </div>

      <div className="charts-grid">
        <article className="panel chart-panel wide">
          <div className="panel-heading">
            <div>
              <h2>Balance de Masas</h2>
              <p>Comparación entre material entrante, saliente y rechazo</p>
            </div>
          </div>
          <div className="simple-chart" aria-label="Balance de masas">
            {massBalanceData.map((item) => {
              const max = 6000
              return (
                <div key={item.month} className="bar-group">
                  <div className="bars">
                    <span className="bar incoming" style={{ height: `${(item.entrada / max) * 100}%` }} />
                    <span className="bar outgoing" style={{ height: `${(item.salida / max) * 100}%` }} />
                    <span className="bar reject" style={{ height: `${(item.rechazo / max) * 100}%` }} />
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-legend">
            <LegendDot tone="incoming" label="Entrante" />
            <LegendDot tone="outgoing" label="Saliente" />
            <LegendDot tone="reject" label="Rechazo" />
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Distribución por Tipo</h2>
              <p>Material procesado este mes</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart">
              <div className="donut-center">
                <strong>6.6 t</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="distribution-list">
              {[
                { label: 'PET', value: '36%', tone: 'incoming' },
                { label: 'Cartón', value: '27%', tone: 'outgoing' },
                { label: 'Papel', value: '18%', tone: 'violet' },
                { label: 'Otros', value: '19%', tone: 'reject' },
              ].map((item) => (
                <div key={item.label} className="distribution-item">
                  <LegendDot tone={item.tone as LegendTone} label={item.label} />
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="panel alert-panel">
        <Icon name="warning" className="panel-alert-icon" />
        <div>
          <h3>Alerta de Coherencia</h3>
          <p>
            Sistema de trazabilidad activo. Todas las transacciones están siendo monitoreadas
            para garantizar coherencia entre registros físicos y digitales.
          </p>
        </div>
      </article>
    </section>
  )

  const renderReception = () => (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Recepción de Material</h1>
          <p>Registro de entrada y generación de tiquete de soporte</p>
        </div>
      </header>

      <div className="content-grid">
        <article className="panel form-panel">
          <div className="panel-heading section-border">
            <h2 className="with-icon">
              <Icon name="scale" className="heading-icon" />
              Formulario de Pesaje
            </h2>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <Field label="Reciclador *" icon="user">
              <select value={selectedRecycler} onChange={(event) => setSelectedRecycler(event.target.value)}>
                <option value="">Seleccione el reciclador</option>
                {recyclers.map((recycler) => (
                  <option key={recycler.id} value={recycler.id}>
                    {recycler.name} - CC {recycler.document}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ruta *" icon="location">
              <select value={selectedRoute} onChange={(event) => setSelectedRoute(event.target.value)}>
                <option value="">Seleccione la ruta</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de Material *" icon="package">
              <select value={selectedMaterial} onChange={(event) => setSelectedMaterial(event.target.value)}>
                <option value="">Seleccione el tipo de material</option>
                {materialTypes.map((material) => (
                  <option key={material.code} value={material.code}>
                    [{material.code}] {material.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Peso Total (kg) *" icon="scale">
              <div className="scale-row">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="0.00"
                  className="scale-input"
                />
                <button type="button" className="button primary tall" onClick={simulateScale} disabled={isWeighing}>
                  <Icon name={isWeighing ? 'refresh' : 'scale'} className={isWeighing ? 'spin' : ''} />
                  {isWeighing ? 'Pesando...' : 'Leer Báscula'}
                </button>
              </div>
              {isWeighing ? (
                <div className="scale-preview">
                  <strong>{simulatedWeight.toFixed(2)} kg</strong>
                  <span>Estabilizando lectura...</span>
                </div>
              ) : null}
            </Field>

            <Field label="Material de Rechazo (kg)" icon="warning" hint="Material sucio, aceitado o no aprovechable que se descarta">
              <input
                type="number"
                step="0.01"
                min="0"
                value={rejection}
                onChange={(event) => setRejection(event.target.value)}
                placeholder="0.00"
              />
            </Field>

            <button type="submit" className="button primary big">
              <Icon name="check" />
              Registrar Transacción
            </button>
          </form>
        </article>

        <aside className="stacked-panels">
          <article className="panel side-panel">
            <h3>Proceso de Verificación</h3>
            <ul className="check-list">
              <li><Icon name="check" /> El operador registra el peso</li>
              <li><Icon name="check" /> El reciclador valida visualmente</li>
              <li><Icon name="check" /> Sistema genera tiquete inmediato</li>
            </ul>
          </article>

          <article className="panel side-panel">
            <h3>Controles del Sistema</h3>
            <ul className="bullet-list">
              <li>Guardado automático al registrar</li>
              <li>No permite edición posterior</li>
              <li>Peso capturado de báscula calibrada</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  )

  const renderInventory = () => (
    <section className="view">
      <header className="view-header">
        <div>
          <h1>Inventario de Material</h1>
          <p>Control de existencias en bodega</p>
        </div>
      </header>

      <div className="stats-grid three">
        <SummaryPanel title="Stock Total" value={`${formatNumber(inventoryTotals.totalStock)} kg`} icon="package" />
        <SummaryPanel title="Tipos de Material" value={String(inventoryData.length)} icon="bar" />
        <SummaryPanel title="Niveles Críticos" value={String(inventoryTotals.criticalItems)} icon="warning" accent="amber" />
      </div>

      <article className="panel filters-panel">
        <div className="filters-grid">
          <label className="search-field">
            <Icon name="search" className="field-icon" />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={inventorySearch}
              onChange={(event) => setInventorySearch(event.target.value)}
            />
          </label>

          <label className="select-field">
            <select value={inventoryStatus} onChange={(event) => setInventoryStatus(event.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="critical">Crítico</option>
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
          </label>
        </div>
      </article>

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2>Existencias Actuales</h2>
        </div>

        {filteredInventory.length > 0 ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>MATERIAL</th>
                  <th className="align-right">STOCK</th>
                  <th className="align-center">ESTADO</th>
                  <th>ÚLTIMA ACTUALIZACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.code}>
                    <td className="code-cell">{item.code}</td>
                    <td>{item.name}</td>
                    <td className="align-right strong-cell">
                      {formatNumber(item.stock)} <span>{item.unit}</span>
                    </td>
                    <td className="align-center">
                      <span className={`status-pill ${item.status}`}>{statusLabel[item.status]}</span>
                    </td>
                    <td>{item.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="package"
            title="No se encontraron materiales"
            text="Ajusta los filtros para revisar otras existencias."
          />
        )}
      </article>
    </section>
  )

  const renderReports = () => (
    <section className={`view ${printPreview ? 'print-preview' : ''}`}>
      <header className="view-header split">
        <div>
          <h1>Centro de Reportes</h1>
          <p>Generación de reportes para SuperServicios y gestión de pagos</p>
        </div>
        {!printPreview ? (
          <button className="button secondary" onClick={() => setPrintPreview(true)}>
            <Icon name="printer" />
            Vista de Impresión
          </button>
        ) : (
          <button className="button secondary" onClick={() => setPrintPreview(false)}>
            Volver al modo normal
          </button>
        )}
      </header>

      {!printPreview ? (
        <>
          <article className="panel filters-panel">
            <div className="report-toolbar">
              <div className="toolbar-label">
                <Icon name="filter" />
                <span>Período</span>
              </div>
              <select value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)}>
                <option value="daily">Diario</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
              <div className="date-chip">
                <Icon name="calendar" />
                Febrero 2026
              </div>
            </div>
          </article>

          <div className="stats-grid four">
            <SummaryPanel title="Material Ingresado" value={`${formatNumber(reportTotals.totalIngresado)} kg`} />
            <SummaryPanel title="Rechazos" value={`${formatNumber(reportTotals.totalRechazos)} kg`} subtitle={`${reportTotals.rejectionPercent}% del total`} accent="amber" />
            <SummaryPanel title="Aprovechado" value={`${formatNumber(reportTotals.totalAprovechado)} kg`} accent="green" />
            <SummaryPanel title="Eficiencia" value={`${(100 - Number.parseFloat(reportTotals.rejectionPercent)).toFixed(1)}%`} accent="gradient" />
          </div>
        </>
      ) : null}

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2 className="with-icon">
            <Icon name="scale" className="heading-icon" />
            Balance de Masas
          </h2>
          {!printPreview ? (
            <button className="button primary" onClick={exportSui}>
              <Icon name="download" />
              Exportar para SUI
            </button>
          ) : null}
        </div>

        <div className="report-chart">
          {balanceData.map((item) => (
            <div key={item.material} className="report-row">
              <div className="report-row-label">{item.material}</div>
              <div className="report-bars">
                <span className="report-bar incoming" style={{ width: `${item.ingresado / 5}%` }} />
                <span className="report-bar reject" style={{ width: `${item.rechazos * 2}%` }} />
                <span className="report-bar outgoing" style={{ width: `${item.aprovechado / 5}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>MATERIAL</th>
                <th className="align-right">INGRESADO</th>
                <th className="align-right">RECHAZOS</th>
                <th className="align-right">APROVECHADO</th>
                <th className="align-right">% RECHAZO</th>
              </tr>
            </thead>
            <tbody>
              {balanceData.map((item) => (
                <tr key={item.material}>
                  <td>{item.material}</td>
                  <td className="align-right">{formatNumber(item.ingresado)}</td>
                  <td className="align-right text-amber">{formatNumber(item.rechazos)}</td>
                  <td className="align-right text-green">{formatNumber(item.aprovechado)}</td>
                  <td className="align-right">{((item.rechazos / item.ingresado) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="table-total">
                <td>TOTAL</td>
                <td className="align-right">{formatNumber(reportTotals.totalIngresado)}</td>
                <td className="align-right">{formatNumber(reportTotals.totalRechazos)}</td>
                <td className="align-right">{formatNumber(reportTotals.totalAprovechado)}</td>
                <td className="align-right">{reportTotals.rejectionPercent}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2 className="with-icon">
            <Icon name="user" className="heading-icon" />
            Resumen de Pagos a Recicladores
          </h2>
          {!printPreview ? (
            <button className="button secondary" onClick={exportPayments}>
              <Icon name="download" />
              Exportar Resumen
            </button>
          ) : null}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>RECICLADOR</th>
                <th className="align-right">TONELADAS</th>
                <th className="align-right">PAGO</th>
                <th className="align-right">EFICIENCIA</th>
              </tr>
            </thead>
            <tbody>
              {recyclerPayments.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td className="align-right">{item.tons.toFixed(2)} t</td>
                  <td className="align-right">{formatMoney(item.payments)}</td>
                  <td className="align-right">{item.efficiency}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )

  const renderHistory = () => (
    <section className="view">
      <header className="view-header split">
        <div>
          <h1>Historial de Transacciones</h1>
          <p>Registro completo de todas las operaciones de recepción</p>
        </div>
        <button className="button primary" onClick={exportTransactions}>
          <Icon name="download" />
          Exportar CSV
        </button>
      </header>

      <div className="stats-grid three">
        <SummaryPanel title="Total Transacciones" value={String(filteredTransactions.length)} icon="history" />
        <SummaryPanel title="Peso Total" value={`${formatNumber(historyTotals.totalWeight)} kg`} icon="scale" />
        <SummaryPanel title="Peso Neto" value={`${formatNumber(historyTotals.netWeight)} kg`} subtitle={`Rechazo: ${formatNumber(historyTotals.totalRejection)} kg`} accent="green" icon="package" />
      </div>

      <article className="panel filters-panel">
        <div className="filters-grid three-col">
          <label className="search-field">
            <Icon name="search" className="field-icon" />
            <input
              type="text"
              placeholder="Buscar por ID o reciclador..."
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
            />
          </label>

          <label className="select-field">
            <select value={historyMaterial} onChange={(event) => setHistoryMaterial(event.target.value)}>
              <option value="all">Todos los materiales</option>
              {materialTypes.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="select-field">
            <select value={historyDate} onChange={(event) => setHistoryDate(event.target.value)}>
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </label>
        </div>
      </article>

      <article className="panel table-panel">
        <div className="panel-heading section-border">
          <h2>Transacciones Registradas</h2>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon="history"
            title="No hay transacciones registradas todavía"
            text="Las transacciones aparecerán aquí después de registrar recepciones de material."
          />
        ) : (
          <div className="history-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="history-card">
                <div className="history-top">
                  <span className="transaction-badge">{transaction.id}</span>
                  <span className="history-date">
                    <Icon name="calendar" />
                    {new Date(transaction.timestamp).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="history-grid">
                  <InfoBlock icon="user" label="Reciclador" value={transaction.recyclerName} />
                  <InfoBlock icon="package" label="Material" value={transaction.materialName} />
                  <InfoBlock icon="scale" label="Peso Total" value={`${transaction.weight.toFixed(2)} kg`} strong />
                  <InfoBlock
                    icon="scale"
                    label="Peso Neto"
                    value={`${(transaction.weight - transaction.rejection).toFixed(2)} kg`}
                    highlight
                    extra={transaction.rejection > 0 ? `(Rechazo: ${transaction.rejection.toFixed(2)} kg)` : undefined}
                  />
                </div>
                <div className="history-footer">
                  <span><strong>Ruta:</strong> {transaction.routeName}</span>
                  <button className="button tertiary" type="button" onClick={() => { setCurrentTransaction(transaction); setReceiptOpen(true) }}>
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h2>ECA ZIPAQUIRÁ</h2>
          <p>Sistema de Gestión</p>
        </div>

        <nav className="nav-list" aria-label="Navegación principal">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon name={item.icon} className="nav-icon" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className={`status-card ${scaleActive ? 'online' : 'offline'}`}>
          <Icon name={scaleActive ? 'wifi' : 'wifiOff'} className="status-icon" />
          <div>
            <strong>{scaleActive ? 'Báscula Activa' : 'Báscula Inactiva'}</strong>
            <span>{scaleActive ? 'Conectada' : 'Sin conexión'}</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>Versión 1.0.0</p>
          <p>SuperServicios Compliant</p>
        </div>
      </aside>

      <main className="main-content">
        {activeView === 'dashboard' ? renderDashboard() : null}
        {activeView === 'recepcion' ? renderReception() : null}
        {activeView === 'inventario' ? renderInventory() : null}
        {activeView === 'reportes' ? renderReports() : null}
        {activeView === 'historial' ? renderHistory() : null}
      </main>

      <button className="floating-button" type="button" aria-label="PQR">
        <Icon name="message" />
      </button>

      <div className="notice-stack" aria-live="polite">
        {notices.map((notice) => (
          <div key={notice.id} className={`notice ${notice.type}`}>
            {notice.message}
          </div>
        ))}
      </div>

      {receiptOpen && currentTransaction ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setReceiptOpen(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="with-icon">
                <Icon name="check" className="heading-icon" />
                Tiquete de Soporte
              </h2>
              <button className="close-button" type="button" onClick={() => setReceiptOpen(false)}>
                ×
              </button>
            </div>

            <div className="receipt-paper">
              <div className="receipt-brand">
                <h3>ECA ZIPAQUIRÁ</h3>
                <p>Estación de Clasificación y Aprovechamiento</p>
                <span>NIT: 123.456.789-0</span>
              </div>

              <div className="receipt-grid">
                <div>
                  <strong>Transacción:</strong>
                  <p>{currentTransaction.id}</p>
                </div>
                <div>
                  <strong>Fecha y Hora:</strong>
                  <p>{new Date(currentTransaction.timestamp).toLocaleString('es-CO')}</p>
                </div>
              </div>

              <div className="receipt-block">
                <strong>Reciclador:</strong>
                <p className="receipt-name">{currentTransaction.recyclerName}</p>
              </div>

              <div className="receipt-grid">
                <div>
                  <strong>Ruta:</strong>
                  <p>{currentTransaction.routeName}</p>
                </div>
                <div>
                  <strong>Material:</strong>
                  <p>{currentTransaction.materialName}</p>
                </div>
              </div>

              <div className="receipt-total">
                <div>
                  <span>Peso Total</span>
                  <strong>{currentTransaction.weight.toFixed(2)} kg</strong>
                </div>
                {currentTransaction.rejection > 0 ? (
                  <div className="receipt-reject">
                    <span>Rechazo</span>
                    <strong>-{currentTransaction.rejection.toFixed(2)} kg</strong>
                  </div>
                ) : null}
                <div className="receipt-net">
                  <span>PESO NETO</span>
                  <strong>{(currentTransaction.weight - currentTransaction.rejection).toFixed(2)} kg</strong>
                </div>
              </div>

              <div className="receipt-foot">
                <p>Sistema de Trazabilidad ECA - Zipaquirá</p>
                <p>SuperServicios Compliant</p>
              </div>
            </div>

            <div className="modal-actions two">
              <button className="button primary" type="button" onClick={() => pushNotice('success', 'Enviando a impresora térmica POS...')}>
                <Icon name="printer" />
                Imprimir Recibo Térmico
              </button>
              <button className="button whatsapp" type="button" onClick={() => pushNotice('success', 'Comprobante enviado por WhatsApp.')}>
                <Icon name="send" />
                Enviar a WhatsApp
              </button>
            </div>

            <button className="button secondary full" type="button" onClick={resetReceptionForm}>
              Nueva Transacción
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string
  icon: IconName
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="field-group">
      <span className="field-label">
        <Icon name={icon} className="field-title-icon" />
        {label}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

function MetricCard({
  title,
  value,
  detail,
  trend,
  trendType,
  icon,
}: {
  title: string
  value: string
  detail: string
  trend: string
  trendType: 'up' | 'down' | 'neutral'
  icon: IconName
}) {
  const trendIcon = trendType === 'up' ? 'trendUp' : trendType === 'down' ? 'trendDown' : icon
  return (
    <article className="panel metric-card">
      <div className="metric-head">
        <div>
          <p>{title}</p>
          <strong>{value}</strong>
        </div>
        <Icon name={icon} className="metric-icon" />
      </div>
      <span className="metric-detail">{detail}</span>
      <span className={`metric-trend ${trendType}`}>
        <Icon name={trendIcon} className="trend-icon" />
        {trend}
      </span>
    </article>
  )
}

function SummaryPanel({
  title,
  value,
  subtitle,
  icon,
  accent,
}: {
  title: string
  value: string
  subtitle?: string
  icon?: IconName
  accent?: 'amber' | 'green' | 'gradient'
}) {
  return (
    <article className={`panel summary-panel ${accent ?? ''}`}>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {icon ? <Icon name={icon} className="summary-icon" /> : null}
    </article>
  )
}

type LegendTone = 'incoming' | 'outgoing' | 'reject' | 'violet'

function LegendDot({ tone, label }: { tone: LegendTone; label: string }) {
  return (
    <span className="legend-item">
      <i className={`legend-dot ${tone}`} />
      {label}
    </span>
  )
}

function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="empty-state">
      <Icon name={icon} className="empty-icon" />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function InfoBlock({
  icon,
  label,
  value,
  strong,
  highlight,
  extra,
}: {
  icon: IconName
  label: string
  value: string
  strong?: boolean
  highlight?: boolean
  extra?: string
}) {
  return (
    <div className="info-block">
      <Icon name={icon} className={`info-icon ${highlight ? 'highlight' : ''}`} />
      <div>
        <span>{label}</span>
        <strong className={strong ? 'value-strong' : highlight ? 'value-highlight' : ''}>{value}</strong>
        {extra ? <small>{extra}</small> : null}
      </div>
    </div>
  )
}

export default App
