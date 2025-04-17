// Vamos a convertir formatos svg, png a formato base64

import fs from 'node:fs/promises';
import path from 'node:path';


const filePath = path.join('images', 'Logo-main.svg');
const readFile = await fs.readFile(filePath, 'base64');






console.log('data:image/svg+xml;base64,', readFile);