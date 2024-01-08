import WaveSurfer from "wavesurfer.js";

export const audioFileRegex = /[^:"'\[\]]+?\.(3gp|aa|aac|aax|act|aiff|alac|amr|ape|au|awb|dss|dvf|flac|gsm|iklax|ivs|m4a|m4b|m4p|mmf|movpkg|mp3|mpc|msv|nmf|ogg|opus|ra|raw|rf64|sln|tta|voc|vox|wav|wma|wv|webm|8svx|cda)/gi;

export const WS = WaveSurfer.create({
    audioRate: 1.0,
    autoCenter: true,
    autoplay: false,
    autoScroll: true,
    backend: "MediaElement",
    barWidth: 3,
    container: "#waveform",
    minPxPerSec: 200,
    normalize: false,
    progressColor: "rgba(100, 100, 100, 1)",
    sampleRate: 11025,
    waveColor: "rgba(210, 41, 57, 1)",
});

export function ankiConnectInvoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({ action, version, params }));
    });
}
