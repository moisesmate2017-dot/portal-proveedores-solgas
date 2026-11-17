const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\R900879\\Downloads\\Formulario_Registro de Proveedor_SOLGAS 2026 vf 2.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Imprimir las primeras 30 filas para entender la estructura (campos requeridos)
  console.log(JSON.stringify(data.slice(0, 30), null, 2));
} catch (error) {
  console.error('Error leyendo Excel:', error);
}
