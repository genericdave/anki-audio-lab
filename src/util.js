import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';

export const audioFileRegex = /[^:"'\[\]]+?\.(3gp|aa|aac|aax|act|aiff|alac|amr|ape|au|awb|dss|dvf|flac|gsm|iklax|ivs|m4a|m4b|m4p|mmf|movpkg|mp3|mpc|msv|nmf|ogg|opus|ra|raw|rf64|sln|tta|voc|vox|wav|wma|wv|webm|8svx|cda)/gi;

export const WS = WaveSurfer.create({
    audioRate: 1.0,
    autoCenter: true,
    autoplay: false,
    autoScroll: true,
    backend: "MediaElement",
    barRadius: 10,
    barWidth: 3,
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


// Spectrogram
WS.registerPlugin(
    Spectrogram.create({
        labels: true,
        splitChannels: false,
        fftSamples: 1024
    })
);

// Regions
const wsRegions = WS.registerPlugin(RegionsPlugin.create());

wsRegions.enableDragSelection({
    color: "rgba(255, 255, 255, 0.2)",
});

{
    let activeRegion = null;
    // wsRegions.on("region-in", (region) => {
    //     console.log("region-in", region);
    //     activeRegion = region;
    // });
    wsRegions.on("region-out", (region) => {
        console.log("Select active region: ", region);
        if (activeRegion === region) {
            WS.pause();
            WS.setTime(region.start);
        }
    });
    wsRegions.on("region-clicked", (region, e) => {
        console.log("Select active region: ", region);
        e.stopPropagation(); // prevent triggering a click on the waveform
        activeRegion = region;
        region.play();
    });
    // Reset the active region when the user clicks anywhere in the waveform
    WS.on("interaction", () => {
        console.log("Deselect active region");
        activeRegion = null;
    });
}


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
