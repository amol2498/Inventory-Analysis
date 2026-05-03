import { useState, useEffect } from 'react'
import { fetchPivot1, fetchChart1 } from '../api/client'
import PivotTable1 from './PivotTable1'
import Chart1 from './Chart1'
import DrillDownModal from './DrillDownModal'
import DownloadButton from './DownloadButton'
import { exportStandardPivot } from '../utils/exportExcel'

export default function Tab1({ filters }) {
  const [pivotData, setPivotData] = useState({ rows: [], columns: [] })
  const [chartData, setChartData] = useState({ data: [], stages: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [drillCell, setDrillCell] = useState(null)
  const [itemInput, setItemInput] = useState('')
  const [itemNumber, setItemNumber] = useState('')

  // Debounce item number input by 350ms
  useEffect(() => {
    const t = setTimeout(() => setItemNumber(itemInput.trim()), 350)
    return () => clearTimeout(t)
  }, [itemInput])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchPivot1(filters, itemNumber), fetchChart1(filters)])
      .then(([pivot, chart]) => {
        setPivotData(pivot)
        setChartData(chart)
      })
      .catch(() => setError('Failed to load data. Please check that the backend is running on port 8000.'))
      .finally(() => setLoading(false))
  }, [JSON.stringify(filters), itemNumber])

  if (error) {
    return (
      <div className="section">
        <div className="error-msg">{error}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="section">
        <div className="loading">Loading data…</div>
      </div>
    )
  }

  const grandTotal = pivotData.rows?.find(r => r['Stages'] === 'Grand Total')
  const totalLines = grandTotal?.Total ?? 0

  return (
    <div>
      <div className="summary-bar">
        <span className="summary-badge">Total PO Lines: <strong>{totalLines}</strong></span>
      </div>

      <div className="section">
        <div className="section-toolbar">
          <div className="item-search">
            <input
              type="text"
              className="item-search-input"
              placeholder="Search Item #…"
              value={itemInput}
              onChange={e => setItemInput(e.target.value)}
            />
            {itemInput && (
              <button className="item-search-clear" onClick={() => setItemInput('')}>✕</button>
            )}
          </div>
          <DownloadButton
            onClick={() => exportStandardPivot(pivotData.rows, pivotData.columns, 'PO_Lines_Analysis')}
            disabled={!pivotData.rows?.length}
          />
        </div>
        <PivotTable1
          data={pivotData}
          onCellClick={(stage, month) => setDrillCell({ stage, month })}
        />
      </div>

      {drillCell && (
        <DrillDownModal
          cell={drillCell}
          filters={filters}
          itemNumber={itemNumber}
          onClose={() => setDrillCell(null)}
        />
      )}

      <div className="section">
        <h2
          className={`section-title section-title-toggle${showChart ? ' open' : ''}`}
          onClick={() => setShowChart(v => !v)}
        >
          PO Lines — Month-wise &amp; Stage-wise
          <span className={`chevron${showChart ? ' open' : ''}`}>▼</span>
        </h2>
        {showChart && <Chart1 data={chartData} />}
      </div>
    </div>
  )
}
