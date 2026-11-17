const ubigeo = require('ubigeo-peru');
const fs = require('fs');
const path = require('path');

const data = ubigeo.reniec;

let mapDeps = {}; 
let mapDists = {}; 

data.forEach(item => {
  if (item.provincia === '00' && item.distrito === '00') {
    mapDeps[item.departamento] = item.nombre;
    mapDists[item.nombre] = [];
  }
});

data.forEach(item => {
  if (item.provincia !== '00' && item.distrito !== '00') {
    const depName = mapDeps[item.departamento];
    if (depName) {
      mapDists[depName].push(item.nombre);
    }
  }
});

for (let dep in mapDists) {
  mapDists[dep] = [...new Set(mapDists[dep])].sort();
}

const utilsPath = path.join(__dirname, 'src', 'utils');
if (!fs.existsSync(utilsPath)) {
  fs.mkdirSync(utilsPath, { recursive: true });
}

fs.writeFileSync(path.join(utilsPath, 'ubigeo.json'), JSON.stringify(mapDists, null, 2));
console.log('Todos los distritos del Perú han sido guardados exitosamente.');
