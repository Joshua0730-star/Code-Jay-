import { byID, query } from "@lib/dom-selector";

// Declarar las propiedades que esperamos en el objeto window


// Esto informa a TypeScript sobre ellas.
declare global {
    interface Window {
        BACKEND_URL?: string;
        currentSelectedTechnologies?: { leftTec?: string; rightTec?: string };
    }
}

// Es crucial que el script inline en index.astro haya definido window.BACKEND_URL
// antes de que este script se ejecute.

const BACKEND_URL = window.BACKEND_URL; // TypeScript ahora debería reconocer BACKEND_URL
// console.log("UI Logic (main-ui-logic.ts) loaded.");
// console.log("BACKEND_URL from window:", BACKEND_URL);

if (!BACKEND_URL) {
    console.error("CRITICAL: BACKEND_URL is not defined on window. Check script order in index.astro and ensure the inline script in index.astro is setting window.BACKEND_URL.");
    // Podrías incluso mostrar un error al usuario aquí o detener la ejecución.
}

window.parent.postMessage({ pluginMessage: { type: "ui-loaded-and-ready-for-selection" } }, "*");
// Botones
const generateButton = byID('generate-button') as HTMLButtonElement | null;
const generateButtonText = byID('generate-button-text') as HTMLSpanElement | null;

// Listas para mostrar los elementos seleccionados
const selectedLayersList = byID('selected-layers-list') as HTMLUListElement | null;
const initialSelectionMessage = byID('initial-selection-message') as HTMLLIElement | null;
const selectedPreviewContainer = byID('selection-preview-container') as HTMLDivElement | null;
// Icono y Loader
const iconGenerate = byID('icon-generate') as HTMLImageElement | null;





if (generateButton && generateButtonText && window.currentSelectedTechnologies) {
    generateButton?.addEventListener('click', () => {
        // codeOutputContainer?.className()
        window.parent.postMessage({ pluginMessage: { type: 'generate-code-request' } }, '*');


        window.onmessage = (msg) => {
            const { pluginMessage } = msg.data
            // console.log({ pluginMessage })

            const { data, type, animation } = pluginMessage
            // console.log(pluginMessage)
            if (animation) {
                generateButtonText.textContent = 'Generating...';
                generateButton.disabled = true;
                generateButton.classList.remove('bg-neutral-800', 'text-neutral-50');
                generateButton.classList.add('bg-neutral-100', 'opacity-100', 'shadow-lg', 'text-neutral-700', 'ring-gray-300', 'ring-1');


                iconGenerate?.classList.add('hidden'); // Oculta el icono de generar

                const loaderCSS = document.createElement('span');
                loaderCSS.classList.add('transition-all', 'duration-200', 'transition-discrete')
                loaderCSS.className = 'loader';

                generateButtonText?.insertBefore(loaderCSS, generateButtonText.firstChild); // Agrega el loader al botón

                // Ocultamos el botton de tecnologias
                const modalButton = document.querySelector('#tecnologias-toggle-button') as HTMLButtonElement | null;


                if (modalButton) {
                    modalButton.classList.add('hidden');
                }



                selectedPreviewContainer?.classList.remove('grow');
                codeOutputContainer?.classList.remove('hidden');
            }
        }
    })
}










// Espacio de generar el codigo, y boton de copiar
const codeOutputContainer = document.getElementById('generated-code-container') as HTMLDivElement | null;
const codeOutputElement = document.getElementById('generated-code-output') as HTMLElement | null;
const codeOutputText = document.getElementById('text-output-code') as HTMLParagraphElement | null
const generatedCodeTitle = document.getElementById('generated-code-title') as HTMLElement | null;
const copyButtonContainer = document.getElementById('copy-button-container') as HTMLDivElement | null;
const copyButton = document.getElementById('copy-code-button') as HTMLButtonElement | null;



if (!generateButton) console.error("Element with ID 'generate-button' not found.");
if (!selectedLayersList) console.error("Element with ID 'selected-layers-list' not found.");
if (!codeOutputElement) console.error("Element with ID 'generated-code-output' not found.");


// Actualiza los elementos seleccionados en la UI
async function updateSelectedLayersUI(nodes: { id: string, name: string, type: string, thumbnail: Uint8Array<ArrayBufferLike> }[]) {

    // // En caso de que no exista o no tenga nada la lista
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
        return false
    }
    nodes.forEach((node, index) => {
        const li = document.createElement('li');
        // li.textContent = `${node.name} (${node.type})`;
        li.className = 'flex items-center gap-2 justify-between p-2 bg-neutral-100 rounded-lg shadow-sm flex-1';

        // Convertir thumbnail a base64


        const base64String = btoa(String.fromCharCode(...Array.from(node.thumbnail)));

        // Crear imagen de preview
        const previewImg = document.createElement('img');

        previewImg.src = `data:image/png;base64,${base64String}`;
        previewImg.className = 'w-auto h-auto max-h-[300px] max-w-[400px]  rounded object-contain object-center';

        previewImg.alt = `Preview of ${node.name}`;


        // Crear contenedor de informacion 

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col gap-2 w-full items-end justify-center ';


        // Nombre del elemento
        const nameElement = document.createElement('div');
        nameElement.textContent = `${node.name} (${node.type})`;
        nameElement.className = 'text-sm font-medium text-neutral-700 truncate text-left';


        // ensamblar el contenido

        infoContainer.appendChild(nameElement);
        li.appendChild(previewImg);
        li.appendChild(infoContainer);
        selectedLayersList.appendChild(li);


        // Manejo de errores
        previewImg.onerror = (err) => {
            previewImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
            previewImg.alt = 'Preview not available';
            console.error('Error loading preview image:', err);
        }
    });

}

window.addEventListener('message', async (event) => {
    const pluginMessage = event.data.pluginMessage; // Se captura el mensaje del plugin
    if (pluginMessage) {
        if (pluginMessage.type === 'selection-changed') {
            const selectedNodesInfo = pluginMessage.data as { id: string, name: string, type: string, thumbnail: Uint8Array<ArrayBufferLike> }[];

            if (initialSelectionMessage && initialSelectionMessage.parentNode === selectedLayersList) {
                selectedLayersList?.removeChild(initialSelectionMessage);
            }
            updateSelectedLayersUI(selectedNodesInfo);
        } else if (pluginMessage.type === 'figma-data') {
            const figmaNodesData = pluginMessage.data;
            const figmaDataError: boolean | null = pluginMessage.error;
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

                if (codeOutputElement && codeOutputText) codeOutputText.textContent = '';
                if (generatedCodeTitle) generatedCodeTitle.textContent = 'Generating Code...';
                if (copyButtonContainer) copyButtonContainer.classList.add('hidden');

                try {
                    const response = await fetch(BACKEND_URL, {
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

                    console.log('haciendo peticion')
                    if (!response.ok) {
                        const errorResult = await response.json().catch(() => ({ error: "Unknown error from backend", details: `HTTP ${response.status} ${response.statusText}` }));
                        throw new Error(errorResult.details || errorResult.error || `Backend request failed: ${response.status} ${response.statusText}`);
                    }
                    const result = await response.json();
                    // console.log('Code generated by AI:', result.code);
                    if (codeOutputText && generatedCodeTitle && copyButtonContainer) {
                        codeOutputText.textContent = result.code || "AI returned no code.";
                        // console.log(codeOutputText.textContent)
                        generatedCodeTitle.textContent = 'Generated Code:';
                        copyButtonContainer.classList.remove('hidden');

                        resetStatusButton();

                    }
                } catch (error: any) {
                    console.error('Error calling backend or processing AI response:', error);
                    resetStatusButton(); // En caso de error llamo al reseteo
                    if (codeOutputElement) {
                        codeOutputElement.textContent = `Error generating code 😔`;

                    }
                    if (generatedCodeTitle) {
                        generatedCodeTitle.textContent = 'Error:';
                    }
                    window.parent.postMessage({ pluginMessage: { type: 'notify', message: `❌ Error: ${error.message}`, error: true, timeout: 5000 } }, '*');
                } finally {
                    if (generateButtonText && generateButton) {
                        generateButtonText.textContent = 'Generate';
                        generateButton.disabled = false;
                    }
                }
            } else if (figmaNodesData && figmaNodesData.length === 0 && !figmaDataError) {
                console.log('No Figma nodes data received for generation, but no explicit error.');
                window.parent.postMessage({ pluginMessage: { type: 'notify', message: 'No data received from Figma layers for generation.', error: true } }, '*');
                if (generateButtonText && generateButton) {
                    generateButtonText.textContent = 'Generate';
                    generateButton.disabled = false;
                }
            }
        }
    }
});



// Reseo de el estado de los botones

function resetStatusButton() {
    const modalButton = document.querySelector('#tecnologias-toggle-button') as HTMLButtonElement | null;


    modalButton?.classList.remove('hidden');

    generateButton?.classList.remove('bg-neutral-100', 'opacity-100', 'shadow-lg', 'text-neutral-700', 'ring-gray-300', 'ring-1');

    generateButton?.classList.add('bg-neutral-800', 'text-neutral-50');

    const loader = generateButton?.querySelector('.loader')

    loader?.classList.toggle('hidden')

    iconGenerate?.classList.remove('hidden')
}


// Funcionalidad de copiado



if (codeOutputText && copyButton) {
    copyButton.addEventListener('click', async (e) => {

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(codeOutputText.innerText);
            } catch (error) {
                console.error('Failed to copy code because clipboard-text is not allowed:', error);
                window.parent.postMessage({
                    pluginMessage: {
                        type: 'notify',
                        message: '❌ Failed to copy code',
                        error: true,
                        method: 'new'
                    }
                }, '*');
            }

        } else {
            // Fallback para navegadores o entornos que bloquean clipboard API

            try {
                console.log('Copiar al metodo antiguo')
                const textarea = document.createElement("textarea");
                textarea.value = codeOutputText.innerText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            } catch (error) {
                console.error('Failed to copy code to old method:', error);
                window.parent.postMessage({
                    pluginMessage: {
                        type: 'notify',
                        message: '❌ Failed to copy code',
                        error: true,
                        method: 'old'

                    }
                }, '*');
            }

        }

        copyButton.classList.add('bg-green-600', 'transition-all', 'duration-200', 'animate-up');
        copyButton.classList.remove('bg-neutral-800', 'hover:bg-neutral-700');

        setTimeout(() => {
            copyButton.classList.remove('bg-green-600', 'animate-up');
            copyButton.classList.add('bg-neutral-800', 'hover:bg-neutral-700');
        }, 1000);

        window.parent.postMessage({
            pluginMessage: {
                type: 'notify',
                message: '✅ Code copied to clipboard!',
                timeout: 2000
            }
        }, '*');
    })


    // Feedback visual


}





// console.log(window.currentSelectedTechnologies);

// Asegura que este archivo sea tratado como un módulo por TypeScript
export { };