import React from 'react';

export default function DataTable({ columns, rows, onRowClick, loading, emptyText = 'No records found.' }) {
  if (loading) return <div className="loading">Loading...</div>;
  if (!rows || rows.length === 0) return <div className="empty-state">{emptyText}</div>;

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable-row' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
