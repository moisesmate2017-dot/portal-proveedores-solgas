const xlsx = require('xlsx');

const filePath = 'C:\\Users\\R900879\\Downloads\\Formulario_Registro de Proveedor_SOLGAS 2026 vf 2.xlsx';
try {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets['BASE DE DATOS'];
  if (sheet) {
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      console.log("Valores en BASE DE DATOS:");
      for (let i = 0; i < 50; i++) {
        if(data[i] && data[i].length > 0) console.log(`Fila ${i}:`, data[i].filter(c => c));
      }
  }
} catch (error) {
  console.error(error);
}
