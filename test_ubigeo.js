const ubigeo = require('ubigeo-peru');
console.log(Object.keys(ubigeo));
console.log(ubigeo.reniec ? ubigeo.reniec.slice(0, 5) : 'no reniec');
