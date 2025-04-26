import fs from 'fs-extra';
import path from 'path';

async function copyFiles() {
    try {
        // Lee el contenido del archivo HTML
        const htmlContent = await fs.readFile('./dist/index.html', 'utf-8');

        // Modifica las rutas de los assets
        const modifiedHtml = htmlContent
            .replace(/href="\/assets\//g, 'href="./assets/')
            .replace(/src="\/assets\//g, 'src="./assets/'); // Añadido para imágenes
        // Guarda el HTML modificado como ui.html
        await fs.writeFile('./ui.html', modifiedHtml);

        // Copia los assets si existen
        if (await fs.exists('./dist/assets')) {
            await fs.copy('./dist/assets', './assets');
        }

        // Copia las imágenes de src/assets si existen
        if (await fs.exists('./src/assets')) {
            await fs.copy('./src/assets', './assets');
        }

        console.log('✅ Archivos copiados exitosamente');
    } catch (err) {
        console.error('❌ Error copiando archivos:', err);
        process.exit(1);
    }
}

copyFiles();