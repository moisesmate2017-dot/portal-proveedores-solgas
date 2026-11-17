const https = require('https');
const fs = require('fs');
const path = require('path');

const DEPARTAMENTOS_URL = 'https://raw.githubusercontent.com/joseluisq/ubigeos-peru/master/json/departamentos.json';
const DISTRITOS_URL = 'https://raw.githubusercontent.com/joseluisq/ubigeos-peru/master/json/distritos.json';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

(async () => {
  try {
    const deps = await fetchJson(DEPARTAMENTOS_URL);
    const dists = await fetchJson(DISTRITOS_URL);

    let dict = {};
    for (let dep of deps) {
      let d_id = dep.id_ubigeo;
      let d_name = dep.nombre_ubigeo;
      // el JSON de joseluisq usa id_ubigeo para dep, y departamento_id para distrito
      let dists_in_dep = dists.filter(d => d.departamento_id === d_id).map(d => d.nombre_ubigeo);
      dict[d_name] = [...new Set(dists_in_dep)].sort(); // remove duplicates
    }

    const utilsPath = path.join(__dirname, 'src', 'utils');
    if (!fs.existsSync(utilsPath)) {
      fs.mkdirSync(utilsPath, { recursive: true });
    }
    
    fs.writeFileSync(path.join(utilsPath, 'ubigeo.json'), JSON.stringify(dict, null, 2));
    console.log("Ubigeo guardado correctamente! Total de departamentos procesados:", Object.keys(dict).length);
  } catch(e) {
    console.error('Error procesando ubigeo:', e);
  }
})();
