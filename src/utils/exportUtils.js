/**
 * Universal Data Export Utilities for Banking Dashboard
 * Supports: CSV, Excel (.xls/.xlsx compatible), PDF, and Print
 */

/**
 * Extract headers and rows from a DOM table element, skipping action/checkbox columns
 */
export function extractTableData(tableElement) {
  if (!tableElement) return { headers: [], rows: [] };

  const thead = tableElement.querySelector('thead');
  const tbody = tableElement.querySelector('tbody');
  if (!tbody) return { headers: [], rows: [] };

  const headerThs = thead ? Array.from(thead.querySelectorAll('th')) : [];
  const skipIndices = new Set();

  const headers = [];
  headerThs.forEach((th, idx) => {
    const text = th.innerText.trim();
    // Skip empty, action, or selection columns
    if (!text || /^(action|actions|select|checkbox|#|\s*)$/i.test(text) && th.querySelector('input[type="checkbox"]')) {
      skipIndices.add(idx);
    } else {
      headers.push(text);
    }
  });

  const trs = Array.from(tbody.querySelectorAll('tr'));
  const rows = [];

  trs.forEach((tr) => {
    // Skip empty state rows or loading skeletons
    if (tr.querySelector('.animate-pulse') || tr.innerText.includes('No records found') || tr.innerText.includes('No data')) {
      return;
    }

    const tds = Array.from(tr.querySelectorAll('td'));
    if (tds.length === 0) return;

    const row = [];
    tds.forEach((td, idx) => {
      if (skipIndices.has(idx)) return;
      // Extract clean text (strip excessive whitespace/newlines)
      let cellText = td.innerText.replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').trim();
      row.push(cellText);
    });

    if (row.length > 0) {
      rows.push(row);
    }
  });

  return { headers, rows };
}

/**
 * Clean and format an item value for CSV
 */
function sanitizeCSVField(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // Escape quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export data to CSV with UTF-8 BOM
 */
export function exportToCSV({ filename = 'export', title, columns, data, tableElement }) {
  let headers = [];
  let rows = [];

  if (data && columns) {
    headers = columns.map(c => typeof c === 'string' ? c : c.label || c.key);
    rows = data.map(item => {
      return columns.map(col => {
        const key = typeof col === 'string' ? col : col.key;
        const val = typeof col.format === 'function' ? col.format(item[key], item) : item[key];
        return val ?? '';
      });
    });
  } else if (tableElement) {
    const extracted = extractTableData(tableElement);
    headers = extracted.headers;
    rows = extracted.rows;
  }

  if (headers.length === 0 && rows.length === 0) {
    throw new Error('No data available to export');
  }

  const csvRows = [];
  // Title row if provided
  if (title) {
    csvRows.push(`"${title.replace(/"/g, '""')}"`);
    csvRows.push(`"Exported on: ${new Date().toLocaleString()}"`);
    csvRows.push('');
  }

  // Header row
  csvRows.push(headers.map(sanitizeCSVField).join(','));

  // Body rows
  rows.forEach(row => {
    csvRows.push(row.map(sanitizeCSVField).join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${slugify(filename)}_${formatDateStamp()}.csv`);
}

/**
 * Export data to Excel Spreadsheet (.xls XML format with proper styling)
 */
export function exportToExcel({ filename = 'export', title = 'Report', columns, data, tableElement }) {
  let headers = [];
  let rows = [];

  if (data && columns) {
    headers = columns.map(c => typeof c === 'string' ? c : c.label || c.key);
    rows = data.map(item => {
      return columns.map(col => {
        const key = typeof col === 'string' ? col : col.key;
        const val = typeof col.format === 'function' ? col.format(item[key], item) : item[key];
        return val ?? '';
      });
    });
  } else if (tableElement) {
    const extracted = extractTableData(tableElement);
    headers = extracted.headers;
    rows = extracted.rows;
  }

  if (headers.length === 0 && rows.length === 0) {
    throw new Error('No data available to export');
  }

  // Generate HTML Spreadsheet with Excel XML namespace
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${escapeXML(title.slice(0, 30))}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; color: #225091; }
        .subtitle { font-size: 10pt; color: #666666; }
        th { background-color: #225091; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #1c4278; text-align: left; }
        td { padding: 6px 12px; border: 1px solid #e2e8f0; font-size: 10pt; }
        tr:nth-child(even) { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${headers.length}" class="title">${escapeXML(title)}</td></tr>
        <tr><td colspan="${headers.length}" class="subtitle">Generated: ${new Date().toLocaleString()} | Advita Co-operative Bank</td></tr>
        <tr></tr>
        <thead>
          <tr>
            ${headers.map(h => `<th>${escapeXML(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${escapeXML(String(cell ?? ''))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, `${slugify(filename)}_${formatDateStamp()}.xls`);
}

/**
 * Universal Print View: Formatted window print for high-quality printing & PDF saving
 */
export function exportToPrint({ title = 'Report', columns, data, tableElement }) {
  let headers = [];
  let rows = [];

  if (data && columns) {
    headers = columns.map(c => typeof c === 'string' ? c : c.label || c.key);
    rows = data.map(item => {
      return columns.map(col => {
        const key = typeof col === 'string' ? col : col.key;
        const val = typeof col.format === 'function' ? col.format(item[key], item) : item[key];
        return val ?? '';
      });
    });
  } else if (tableElement) {
    const extracted = extractTableData(tableElement);
    headers = extracted.headers;
    rows = extracted.rows;
  }

  if (headers.length === 0 && rows.length === 0) {
    throw new Error('No data available to print');
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print reports');
    return;
  }

  const printDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeXML(title)} - Print View</title>
      <style>
        @page {
          size: landscape;
          margin: 12mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #1a202c;
          margin: 0;
          padding: 20px;
          background: #fff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 2px solid #225091;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .org-name {
          font-size: 18px;
          font-weight: 800;
          color: #225091;
          letter-spacing: -0.02em;
        }
        .report-title {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
          margin-top: 4px;
        }
        .meta {
          text-align: right;
          font-size: 11px;
          color: #718096;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th {
          background-color: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .footer {
          margin-top: 20px;
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="org-name">Advita Co-operative Bank Panel</div>
          <div class="report-title">${escapeXML(title)}</div>
        </div>
        <div class="meta">
          <div><strong>Printed:</strong> ${new Date().toLocaleString()}</div>
          <div><strong>Total Records:</strong> ${rows.length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${escapeXML(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${escapeXML(String(cell ?? ''))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        Generated from Advita Banking Platform &bull; Confidential &bull; Page 1 of 1
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printDoc);
  printWindow.document.close();
}

/**
 * Universal PDF Export (triggers standard print-to-PDF view)
 */
export function exportToPDF(options) {
  exportToPrint(options);
}

// Helpers
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

function formatDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function escapeXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
