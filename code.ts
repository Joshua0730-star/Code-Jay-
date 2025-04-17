// Variable global "figma": nos permite acceder a todo el documento de figma


// showUI(): despliega un modal en figma mostrando el html pasado como argumento

//__html__ : es una variable global que hace referencia al string especificado en "ui" en el archivo manifest.json, si son varios archivos se debe especificar la manera adecuada

figma.showUI(__html__, {
    height: 500,
    width: 700
})

//onmessage(): metodo que nos permite capturar el mismo valor que se pasa a traves del metodo postMessage desde javascript
figma.ui.onmessage = async(pluginMessage) => {
    // console.log('Data recibida');
    
    // Cargaremos la fuente! aqui por que es asincrono
    await figma.loadFontAsync({family: "Rounded Mplus 1c", style: "Regular"})


    // complementando para hacer zoom sobre un elemento deseado(figma.viewport.scrollAnd.....)

    // Array que almacenara los nodos, indicamos con typescript que va a ser un array de nodos
    const nodes:SceneNode[] = []


    // Carga todas las paginas del documento de manera asincrona
    figma.loadAllPagesAsync();



    // figma.closePlugin(); // <-- Cierra el plugin para evitar comportamientos inesperados



}




// root: accede a la raiz de todo, referenciando a todas las paginas de figma, y no solo a la pagina actual, (currentPage), es decir root hace referencia a todo el documento

//findOne(): metodo que retorna el nodo que cumpla con las condiciones establecidas en el callback que se le pasa como argumento, en este caso buscara todos los nodos disponibles y retornara aquel nodo que cumpla con las condiciones establecidas


// figma.root.findOne(node => node.type == 'COMPONENT_SET' && node.name == 'square');