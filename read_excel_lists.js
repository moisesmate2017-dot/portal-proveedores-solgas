const xlsx = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\R900879\\Downloads\\Formulario_Registro de Proveedor_SOLGAS 2026 vf 2.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  console.log("Hojas disponibles:", workbook.SheetNames);
  
  if (workbook.SheetNames.length > 1) {
      const sheetName = workbook.SheetNames[1];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("Datos de la segunda hoja (posibles listas):");
      for (let i = 0; i < 20; i++) {
        if(data[i]) console.log(`Fila ${i}:`, data[i].filter(c => c));
      }
  }
} catch (error) {
  console.error('Error leyendo Excel:', error);
}
