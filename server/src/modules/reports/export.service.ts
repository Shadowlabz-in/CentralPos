// CSV generation
export function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const vals = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return '';
      const str = String(v);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(vals.join(','));
  }
  return lines.join('\n');
}

// Excel XML (simple table-based XLS)
export function toExcelXml(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const xmlRows = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Report">
  <Table>\n`;

  for (const row of xmlRows) {
    xml += '   <Row>\n';
    for (const cell of row) {
      const isNum = typeof cell === 'number' && !isNaN(cell);
      xml += `    <Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>\n`;
    }
    xml += '   </Row>\n';
  }

  xml += `  </Table>
 </Worksheet>
</Workbook>`;
  return xml;
}
