import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// Generate PDF Report using pdfkit
export const generatePdfReport = async (title, headers, rows) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Title header
      doc.fontSize(16).fillColor('#1E293B').font('Helvetica-Bold').text(title, { align: 'center' });
      doc.fontSize(10).fillColor('#64748B').font('Helvetica').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Simple Table layout
      const tableTop = doc.y;
      const columnSpacing = 550 / headers.length;

      // Render headers
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E293B');
      headers.forEach((h, i) => {
        doc.text(h.toUpperCase(), 30 + i * columnSpacing, tableTop);
      });

      // Draw underline
      doc.moveTo(30, tableTop + 14).lineTo(570, tableTop + 14).stroke('#E2E8F0');
      doc.moveDown(1.5);

      // Render rows
      let currentY = tableTop + 24;
      doc.font('Helvetica').fontSize(9).fillColor('#334155');

      rows.forEach((row) => {
        // Handle overflow page breaks
        if (currentY > 750) {
          doc.addPage();
          currentY = 30;
        }

        row.forEach((val, i) => {
          doc.text(String(val !== null && val !== undefined ? val : '—').substring(0, 20), 30 + i * columnSpacing, currentY);
        });
        currentY += 20;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate Excel Report using exceljs
export const generateExcelReport = async (title, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  // Set columns header
  worksheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: 22 }));

  // Apply basic header styling
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Arial', family: 4, size: 10, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' } // Blue primary color
  };

  // Add rows
  rows.forEach(r => worksheet.addRow(r));

  // Auto-width adjustment
  worksheet.columns.forEach(column => {
    let maxLen = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : '';
      if (value.length > maxLen) {
        maxLen = value.length;
      }
    });
    column.width = Math.max(maxLen + 4, 15);
  });

  return await workbook.xlsx.writeBuffer();
};
