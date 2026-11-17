const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\R900879\\Downloads\\Formulario_Registro de Proveedor_SOLGAS 2026 vf 2.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = 'DATOS'; // o 'REGISTRAR LOS DATOS'
  if (workbook.Sheets[sheetName]) {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      console.log("Valores de listas en hoja DATOS:");
      for (let i = 0; i < 20; i++) {
        if(data[i]) console.log(`Fila ${i}:`, data[i].filter(c => c));
      }
  } else if (workbook.Sheets['REGISTRAR LOS DATOS']) {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets['REGISTRAR LOS DATOS'], { header: 1 });
      console.log("Valores de listas en hoja REGISTRAR LOS DATOS:");
      for (let i = 0; i < 20; i++) {
        if(data[i]) console.log(`Fila ${i}:`, data[i].filter(c => c));
      }
  }
} catch (error) {
  console.error('Error leyendo Excel:', error);
}
