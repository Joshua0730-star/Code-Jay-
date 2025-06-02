var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Es crucial que el script inline en index.astro haya definido window.BACKEND_URL
// antes de que este script se ejecute.
const BACKEND_URL = window.BACKEND_URL; // TypeScript ahora debería reconocer BACKEND_URL
console.log("UI Logic (main-ui-logic.ts) loaded.");
console.log("BACKEND_URL from window:", BACKEND_URL);
if (!BACKEND_URL) {
    console.error("CRITICAL: BACKEND_URL is not defined on window. Check script order in index.astro and ensure the inline script in index.astro is setting window.BACKEND_URL.");
    // Podrías incluso mostrar un error al usuario aquí o detener la ejecución.
}
window.parent.postMessage({ pluginMessage: { type: "ui-loaded-and-ready-for-selection" } }, "*");
// Botones
const generateButton = document.getElementById('generate-button');
const generateButtonText = document.getElementById('generate-button-text');
// Listas para mostrar los elementos seleccionados
const selectedLayersList = document.getElementById('selected-layers-list');
const initialSelectionMessage = document.getElementById('initial-selection-message');
const selectedPreviewContainer = document.getElementById('selection-preview-container');
if (generateButton) {
    generateButton.addEventListener('click', () => {
        if (generateButtonText && generateButton && window.currentSelectedTechnologies) {
            generateButtonText.textContent = 'Generating...';
            generateButton.disabled = true;
        }
        selectedPreviewContainer === null || selectedPreviewContainer === void 0 ? void 0 : selectedPreviewContainer.classList.remove('grow');
        codeOutputContainer === null || codeOutputContainer === void 0 ? void 0 : codeOutputContainer.classList.remove('hidden');
        // codeOutputContainer?.className()
        window.parent.postMessage({ pluginMessage: { type: 'generate-code-request' } }, '*');
    });
}
// Espacio de generar el codigo, y boton de copiar
const codeOutputContainer = document.getElementById('generated-code-container');
const codeOutputElement = document.getElementById('generated-code-output');
const generatedCodeTitle = document.getElementById('generated-code-title');
const copyButtonContainer = document.getElementById('copy-button-container');
const copyButton = document.getElementById('copy-code-button');
if (!generateButton)
    console.error("Element with ID 'generate-button' not found.");
if (!selectedLayersList)
    console.error("Element with ID 'selected-layers-list' not found.");
if (!codeOutputElement)
    console.error("Element with ID 'generated-code-output' not found.");
// Actualiza los elementos seleccionados en la UI
function updateSelectedLayersUI(nodes) {
    // En caso de que no exista o no tenga nada la lista
    if (!selectedLayersList) {
        console.error("selectedLayersList is null in updateSelectedLayersUI");
        return;
    }
    selectedLayersList.innerHTML = '';
    // Agrega un mensaje inicial si no hay nodos seleccionados
    if (nodes.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No layers selected in Figma.';
        li.className = 'text-neutral-500 italic';
        selectedLayersList.appendChild(li); // Introduce el mensaje inicial dentro de la lista
    }
    else {
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.textContent = `${node.name} (${node.type})`; // <-- renderiza esto para mostrar la informacion de los elementos seleccionados por el usuario
            selectedLayersList.appendChild(li);
        });
    }
}
window.addEventListener('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    const pluginMessage = event.data.pluginMessage; // Se captura el mensaje del plugin
    if (pluginMessage) {
        if (pluginMessage.type === 'selection-changed') {
            const selectedNodesInfo = pluginMessage.data;
            if (initialSelectionMessage && initialSelectionMessage.parentNode === selectedLayersList) {
                selectedLayersList === null || selectedLayersList === void 0 ? void 0 : selectedLayersList.removeChild(initialSelectionMessage);
            }
            updateSelectedLayersUI(selectedNodesInfo);
        }
        else if (pluginMessage.type === 'figma-data') {
            const figmaNodesData = pluginMessage.data;
            const figmaDataError = pluginMessage.error;
            // Acceder a window.currentSelectedTechnologies. TypeScript debería reconocerlo ahora.
            const selectedTechs = window.currentSelectedTechnologies;
            console.log(selectedTechs);
            if (!BACKEND_URL) {
                console.error("Cannot proceed with API call: BACKEND_URL is not defined.");
                window.parent.postMessage({ pluginMessage: { type: 'notify', message: '❌ Critical Error: Backend URL not configured.', error: true } }, '*');
                if (generateButtonText && generateButton) {
                    generateButtonText.textContent = 'Generate';
                    generateButton.disabled = false;
                }
                return;
            }
            if (figmaDataError) {
                console.error('Error from Figma plugin:', figmaDataError);
                if (generateButtonText && generateButton) {
                    generateButtonText.textContent = 'Generate';
                    generateButton.disabled = false;
                }
                return;
            }
            if (!selectedTechs || !selectedTechs.leftTec || !selectedTechs.rightTec) {
                console.error('Technologies not selected. Current window.currentSelectedTechnologies:', window.currentSelectedTechnologies);
                if (generateButtonText && generateButton) {
                    generateButtonText.textContent = 'Generate';
                    generateButton.disabled = false;
                }
                window.parent.postMessage({ pluginMessage: { type: 'notify', message: '⚠️ Error: Technologies not found. Please select again.', error: true } }, '*');
                return;
            }
            if (figmaNodesData && figmaNodesData.length > 0) {
                console.log('Figma nodes data received for generation:', figmaNodesData);
                console.log('Selected technologies for generation:', selectedTechs);
                if (codeOutputElement)
                    codeOutputElement.textContent = '';
                if (generatedCodeTitle)
                    generatedCodeTitle.textContent = 'Generating Code...';
                if (copyButtonContainer)
                    copyButtonContainer.classList.add('hidden');
                try {
                    const response = yield fetch(BACKEND_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            figmaData: figmaNodesData,
                            technologies: {
                                leftTec: selectedTechs.leftTec,
                                rightTec: selectedTechs.rightTec
                            }
                        })
                    });
                    if (!response.ok) {
                        const errorResult = yield response.json().catch(() => ({ error: "Unknown error from backend", details: `HTTP ${response.status} ${response.statusText}` }));
                        throw new Error(errorResult.details || errorResult.error || `Backend request failed: ${response.status} ${response.statusText}`);
                    }
                    const result = yield response.json();
                    console.log('Code generated by AI:', result.code);
                    if (codeOutputElement) {
                        codeOutputElement.textContent = result.code || "AI returned no code.";
                    }
                    if (generatedCodeTitle) {
                        generatedCodeTitle.textContent = 'Generated Code:';
                    }
                    if (copyButtonContainer) {
                        copyButtonContainer.classList.remove('hidden');
                    }
                }
                catch (error) {
                    console.error('Error calling backend or processing AI response:', error);
                    if (codeOutputElement) {
                        codeOutputElement.textContent = `Error generating code: ${error.message}`;
                    }
                    if (generatedCodeTitle) {
                        generatedCodeTitle.textContent = 'Error:';
                    }
                    window.parent.postMessage({ pluginMessage: { type: 'notify', message: `❌ Error: ${error.message}`, error: true, timeout: 5000 } }, '*');
                }
                finally {
                    if (generateButtonText && generateButton) {
                        generateButtonText.textContent = 'Generate';
                        generateButton.disabled = false;
                    }
                }
            }
            else if (figmaNodesData && figmaNodesData.length === 0 && !figmaDataError) {
                console.log('No Figma nodes data received for generation, but no explicit error.');
                window.parent.postMessage({ pluginMessage: { type: 'notify', message: 'No data received from Figma layers for generation.', error: true } }, '*');
                if (generateButtonText && generateButton) {
                    generateButtonText.textContent = 'Generate';
                    generateButton.disabled = false;
                }
            }
        }
    }
}));
// Funcionalidad de copiado
if (copyButton) {
    copyButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        if (codeOutputElement && codeOutputElement.textContent) {
            try {
                yield navigator.clipboard.writeText(codeOutputElement.textContent);
                // Feedback visual
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.classList.add('bg-green-600');
                copyButton.classList.remove('bg-neutral-800');
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.classList.remove('bg-green-600');
                    copyButton.classList.add('bg-neutral-800');
                }, 2000);
                window.parent.postMessage({
                    pluginMessage: {
                        type: 'notify',
                        message: '✅ Code copied to clipboard!',
                        timeout: 2000
                    }
                }, '*');
            }
            catch (error) {
                console.error('Failed to copy code:', error);
                window.parent.postMessage({
                    pluginMessage: {
                        type: 'notify',
                        message: '❌ Failed to copy code',
                        error: true
                    }
                }, '*');
            }
        }
    }));
}
console.log(window.currentSelectedTechnologies);
export {};
