const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\R900879\\Downloads\\Formulario_Registro de Proveedor_SOLGAS 2026 vf 2.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Imprimir los valores crudos para ver TODAS las celdas importantes
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("Extrayendo estructura y posibles listas...");
  for (let i = 0; i < 40; i++) {
    const row = data[i];
    if (row && row.some(cell => cell)) {
       console.log(`Fila ${i}:`, row.filter(cell => cell !== null && cell !== undefined && cell !== ''));
    }
  }
} catch (error) {
  console.error('Error leyendo Excel:', error);
}
