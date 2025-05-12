import fs from 'fs-extra';
import path from 'path';

async function copyFiles() {
    try {
        // Lee el contenido del archivo HTML generado por Astro
        const htmlContent = await fs.readFile('./dist/index.html', 'utf-8');

        // Modifica las rutas de los assets para que sean relativas a ui.html
        // Astro genera rutas como /assets/..., las cambiamos a ./assets/...
        const modifiedHtml = htmlContent
            .replace(/href="\/assets\//g, 'href="./assets/')
            .replace(/src="\/assets\//g, 'src="./assets/');
        // Guarda el HTML modificado como ui.html en la raíz del proyecto
        await fs.writeFile('./ui.html', modifiedHtml);

        // Copia la carpeta de assets procesados por Astro (dist/assets) a la raíz del proyecto
        // Esta carpeta contendrá tus imágenes con nombres hasheados, etc.
        if (await fs.exists('./dist/assets')) {
            await fs.copy('./dist/assets', './assets', { overwrite: true }); // Asegura que se sobrescriba si ya existe
        } else {
            console.warn('⚠️ Carpeta dist/assets no encontrada. No se copiaron assets.');
        }

        console.log('✅ Archivos de UI y assets procesados y copiados exitosamente para Figma.');
    } catch (err) {
        console.error('❌ Error procesando archivos para Figma:', err);
        process.exit(1);
    }
}

copyFiles();