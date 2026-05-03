import { useState, useEffect } from 'react'
import { fetchPivot1DrillDown } from '../api/client'

export default function DrillDownModal({ cell, filters, itemNumber, onClose }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchPivot1DrillDown(cell.stage, cell.month, filters, itemNumber)
      .then(setResult)
      .catch(() => setError('Failed to load detail data.'))
      .finally(() => setLoading(false))
  }, [cell.stage, cell.month, JSON.stringify(filters), itemNumber])

  const stageLabel = (!cell.stage || cell.stage === 'Grand Total') ? 'All Stages' : cell.stage
  const monthLabel = (!cell.month || cell.month === 'Total') ? 'All Months' : cell.month
  const title = `${stageLabel} — ${monthLabel}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {result && (
              <div className="modal-subtitle">{result.total} PO line{result.total !== 1 ? 's' : ''}</div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <div className="loading">Loading…</div>}
          {error && <div className="error-msg">{error}</div>}
          {result && result.rows.length === 0 && (
            <div className="no-data">No PO lines for this selection.</div>
          )}
          {result && result.rows.length > 0 && (
            <div className="table-container">
              <table className="pivot-table drill-table">
                <thead>
                  <tr>
                    {result.columns.map(col => (
                      <th key={col} className="col-stage">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, idx) => (
                    <tr key={idx}>
                      {result.columns.map(col => (
                        <td key={col} className="col-stage">
                          {row[col] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
