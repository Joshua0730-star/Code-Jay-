"use strict";
figma.showUI(__html__, { width: 700, height: 500 });
figma.ui.onmessage = (msg) => {
    if (msg === "Hello from Astro!") {
        console.log("Message received from UI");
        figma.notify("Message received from UI!");
    }
};
