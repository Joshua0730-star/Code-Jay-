const DEV_MODE = false; // Ponlo en false o elimínalo para el build final
if (DEV_MODE) {
  figma.showUI("http://localhost:3000", { width: 700, height: 650 }); // Usa el puerto de Astro dev
} else {
  figma.showUI(__html__, { width: 700, height: 650 });
}

// Función para serializar y enviar la selección actual
async function sendCurrentSelectionToUI() {
  const selectedNodes = figma.currentPage.selection as SceneNode[]; // Asegúrate de que sea un array de SceneNode
  const serializedNodesInfo = [];

  if (selectedNodes.length > 0) {
    for (const node of selectedNodes) {
      // Para la previsualización, solo necesitamos información básica
      // como el nombre y el tipo, quizás una miniatura si es viable.
      // La serialización completa se hará cuando se pida 'generate-code-request'.
      serializedNodesInfo.push({
        id: node.id,
        name: node.name,
        type: node.type,
        // Podrías intentar exportar una miniatura aquí, pero ten cuidado con el rendimiento
        // y el tamaño del mensaje. Por ahora, solo nombre y tipo.
        // thumbnail: await node.exportAsync({ format: 'PNG', constraint: { type: 'HEIGHT', value: 32 }}) // Ejemplo
      });
    }
  }
  // Enviar solo la información necesaria para la previsualización
  figma.ui.postMessage({ type: 'selection-changed', data: serializedNodesInfo });
}


// Enviar la selección inicial cuando la UI se carga
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ui-loaded-and-ready-for-selection') { // La UI nos dice que está lista

    console.log('UI is ready, sending initial selection.');
    await sendCurrentSelectionToUI(); // Enviar selección actual al cargar la UI
  } else if (msg.type === 'generate-code-request') {
    const selectedNodes = figma.currentPage.selection as SceneNode[];

    if (selectedNodes.length === 0) {
      figma.ui.postMessage({ type: 'figma-data', data: [], error: 'No layers selected. Please select some layers to generate code.' });
      figma.notify('⚠️ No layers selected. Please select some layers.', { error: true });
      return;
    }

    const serializedNodes = []; // Array para la serialización completa
    for (const node of selectedNodes) {
      const nodeData: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        parentId: node.parent ? node.parent.id : null,
        visible: node.visible,
      };

      if ('fills' in node && 'strokes' in node && 'effects' in node && 'opacity' in node) {
        nodeData.fills = node.fills;
        nodeData.strokes = node.strokes;
        nodeData.strokeWeight = node.strokeWeight;
        nodeData.strokeAlign = node.strokeAlign;
        nodeData.effects = node.effects;
        nodeData.opacity = node.opacity;
        if ('cornerRadius' in node) {
          nodeData.cornerRadius = node.cornerRadius;
        } else {
          nodeData.cornerRadius = 0;
        }
      } else {
        nodeData.fills = [];
        nodeData.strokes = [];
        nodeData.strokeWeight = 0;
        nodeData.strokeAlign = 'INSIDE';
        nodeData.cornerRadius = 0;
        nodeData.effects = [];
        nodeData.opacity = 1;
      }

      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === 'GROUP') {
        if ('layoutMode' in node) {
          nodeData.layoutMode = node.layoutMode;
          nodeData.primaryAxisSizingMode = node.primaryAxisSizingMode;
          nodeData.counterAxisSizingMode = node.counterAxisSizingMode;
          nodeData.primaryAxisAlignItems = node.primaryAxisAlignItems;
          nodeData.counterAxisAlignItems = node.counterAxisAlignItems;
          nodeData.paddingLeft = node.paddingLeft;
          nodeData.paddingRight = node.paddingRight;
          nodeData.paddingTop = node.paddingTop;
          nodeData.paddingBottom = node.paddingBottom;
          nodeData.itemSpacing = node.itemSpacing;
        } else {
          nodeData.layoutMode = 'NONE';
        }
      } else {
        nodeData.layoutMode = 'NONE';
      }

      if (node.type === 'TEXT') {
        nodeData.characters = node.characters;
        nodeData.fontSize = node.fontSize;
        nodeData.fontName = node.fontName;
        nodeData.textAlignHorizontal = node.textAlignHorizontal;
        nodeData.textAlignVertical = node.textAlignVertical;
        nodeData.lineHeight = node.lineHeight;
        nodeData.letterSpacing = node.letterSpacing;
        // if (typeof node.fontName === 'object' && node.fontName !== figma.mixed) {
        //   try {
        //     await figma.loadFontAsync(node.fontName as FontName);
        //   } catch (e) { console.error("Error loading font for text node:", node.name, e); }
        // }
      }
      serializedNodes.push(nodeData); // Aquí va la serialización completa
    }
    // Enviar los datos completos para la generación de código
    figma.ui.postMessage({ type: 'figma-data', data: serializedNodes });
    figma.notify(`✅ Sent ${serializedNodes.length} layer(s) data to UI for generation.`);

  } else if (msg.pluginMessage && msg.pluginMessage.type === "ui-loaded") { // Mensaje original de index.astro
    console.log("Message received from UI (Astro): UI Loaded");
    // Podrías enviar la selección aquí también si la UI no envía 'ui-loaded-and-ready-for-selection'
    // await sendCurrentSelectionToUI();
  } else if (msg.type === 'notify') {
    figma.notify(msg.message, { timeout: msg.timeout || 3000, error: msg.error || false });
  }
};

// Escuchar cambios en la selección de Figma
figma.on('selectionchange', async () => {
  console.log('Figma selection changed, updating UI.');
  await sendCurrentSelectionToUI();
});