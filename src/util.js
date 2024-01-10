import WaveSurfer from "wavesurfer.js";
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js';
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
const colormap = require('colormap');

export const audioFileRegex = /[^:"'\[\]]+?\.(3gp|aa|aac|aax|act|aiff|alac|amr|ape|au|awb|dss|dvf|flac|gsm|iklax|ivs|m4a|m4b|m4p|mmf|movpkg|mp3|mpc|msv|nmf|ogg|opus|ra|raw|rf64|sln|tta|voc|vox|wav|wma|wv|webm|8svx|cda)/gi;

export const WS = WaveSurfer.create({
    audioRate: 1.0,
    autoCenter: true,
    autoplay: false,
    autoScroll: true,
    backend: "MediaElement",
    barWidth: 1,
    barGap: 0,
    barAlign: "bottom",
    container: "#waveform",
    cursorColor: "rgba(255, 255, 255, 0.5)",
    cursorWidth: 1,
    height: 150,
    minPxPerSec: 200,
    normalize: true,
    progressColor: "rgba(255, 255, 255, 0.2)",
    sampleRate: 11025,
    waveColor: "rgba(210, 40, 60, 1)",
});

// Hover
WS.registerPlugin(
    Hover.create({
        lineColor: "rgba(255, 255, 255, 0.4)",
        labelColor: "rgba(255, 255, 255, 0)",
        labelBackground: "rgba(255, 255, 255, 0)",
    })
);

// Spectrogram
const colors = colormap({
    colormap: 'cubehelix',
    nshades: 256,
    format: 'float'
});

WS.registerPlugin(
    Spectrogram.create({
        labels: false,
        splitChannels: false,
        fftSamples: 512,
        colorMap: colors
    })
);

// Regions
const WSRegions = WS.registerPlugin(RegionsPlugin.create());

WSRegions.enableDragSelection({
    color: "rgba(255, 255, 255, 0.2)",
});

let activeRegion = null;
export function removeActiveRegion() {
    if (!activeRegion) return;
    activeRegion.remove();
}

export function removeAllRegions() {
    WSRegions.clearRegions();
    activeRegion = null;
}

WSRegions.on("region-created", (region) => {
    console.log("Select active region: ", region);
    activeRegion = region;
    WS.pause();
    WS.setTime(region.start);
});

WSRegions.on("region-updated", (region) => {
    console.log("Select active region: ", region);
    activeRegion = region;
    WS.pause();
    WS.setTime(region.start);
});

WS.on("timeupdate", (currentTime) => {
    if (!activeRegion) return;
    if (currentTime < activeRegion.end) return;
    WS.pause();
    WS.setTime(activeRegion.start);
});

WSRegions.on("region-clicked", (region, e) => {
    e.stopPropagation(); // Prevent triggering a click on the waveform.
    console.log("Select active region: ", region);
    activeRegion = region;
    region.play();
});

WS.on("interaction", () => {
    // Deselect the active region when the user clicks elsewhere in the waveform.
    activeRegion = null;
});


export function ankiConnectInvoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("error", () => reject("failed to issue request"));
        xhr.addEventListener("load", () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw "response has an unexpected number of fields";
                }
                if (!response.hasOwnProperty("error")) {
                    throw "response is missing required error field";
                }
                if (!response.hasOwnProperty("result")) {
                    throw "response is missing required result field";
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open("POST", "http://127.0.0.1:8765");
        xhr.send(JSON.stringify({ action, version, params }));
    });
}
