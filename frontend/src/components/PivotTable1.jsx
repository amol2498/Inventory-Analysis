/**
 * PivotTable1 – PO Line count pivot table.
 * Rows = Stages (Column I), Columns = Months (Mar'26, Apr'26 …) + Total.
 * Last row is the Total row. Cells with 0 show blank (matching reference layout).
 */
const STAGE_COL = 'Stages'

export default function PivotTable1({ data, onCellClick }) {
  const { rows, columns } = data

  if (!rows || rows.length === 0) {
    return <div className="no-data">No data available for the selected filters.</div>
  }

  const monthCols = columns.filter(c => c !== STAGE_COL && c !== 'Total')

  const handleClick = (stage, month, value) => {
    if (!onCellClick || !value) return
    onCellClick(stage, month)
  }

  return (
    <div className="table-container">
      <table className="pivot-table">
        <thead>
          <tr>
            <th className="col-stage">Stages</th>
            {monthCols.map(col => (
              <th key={col} className="col-number">{col}</th>
            ))}
            <th className="col-number col-total-header">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isTotalRow = row[STAGE_COL] === 'Grand Total'
            const stage = row[STAGE_COL]
            return (
              <tr key={idx} className={isTotalRow ? 'grand-total-row' : ''}>
                <td className="col-stage">{stage}</td>
                {monthCols.map(col => {
                  const val = row[col]
                  const clickable = onCellClick && val
                  return (
                    <td
                      key={col}
                      className={`col-number${clickable ? ' cell-clickable' : ''}`}
                      onClick={() => handleClick(stage, col, val)}
                    >
                      {val || ''}
                    </td>
                  )
                })}
                {(() => {
                  const total = row['Total']
                  const clickable = onCellClick && total
                  return (
                    <td
                      className={`col-number col-total-cell${clickable ? ' cell-clickable' : ''}`}
                      onClick={() => handleClick(stage, 'Total', total)}
                    >
                      {total ?? ''}
                    </td>
                  )
                })()}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
