import _ from "lodash";
import WaveSurfer from "wavesurfer.js";
import * as util from "./util.js";

// Config
const MaxRate = 2;
const MinRate = 0.2;


// Elements
const StatusText = document.getElementById("status-text");
const FieldNameSelect = document.getElementById("field-name-select");
const PlaybackDisplay = document.getElementById("playback-display");


// Init
const WS = WaveSurfer.create({
    container: "#waveform",
    waveColor: "rgba(200, 200, 200, 0.5)",
    progressColor: "rgba(100, 100, 100, 0.5)",
    minPxPerSec: 200,
    sampleRate: 11025,
});


// Events
FieldNameSelect.addEventListener("change", userInfoChanged);
WS.on("interaction", () => { WS.playPause(); });

document.addEventListener('keydown', function (event) {
    let shouldPreventDefault = true;

    switch (event.code) {
        case 'Space':
            WS.playPause();
            break;
        case 'ArrowLeft':
            WS.skip(-0.5); // Skip back half a second
            break;
        case 'ArrowRight':
            WS.skip(0.5); // Skip forward half a second
            break;
        case 'ArrowUp':
            // Increase playback speed
            const upRate = Math.min(WS.getPlaybackRate() + 0.2, MaxRate).toFixed(1);
            WS.setPlaybackRate(Number(upRate));
            PlaybackDisplay.innerText = upRate;
            break;
        case 'ArrowDown':
            // Decrease playback speed
            const downRate = Math.max(WS.getPlaybackRate() - 0.2, MinRate).toFixed(1);
            WS.setPlaybackRate(Number(downRate));
            PlaybackDisplay.innerText = downRate;
            break;
        case 'BracketLeft': // `[` key
            WS.seekTo(0); // Go to the beginning of the audio
            break;
        case 'BracketRight': // `]` key
            WS.seekTo(1); // Go to the end of the audio
            break;
        default:
            shouldPreventDefault = false;
            break;
    }
    if (shouldPreventDefault) event.preventDefault();
});


// Logic
function updateStatus(message) {
    console.log(`New status: ${message}.`);
    StatusText.textContent = message;
}

function clearAudio() {
    console.log("Audio cleared.");
    WS.empty();
    WS.toggleInteraction(false);
}

function clearCardInfo() {
    console.log("Card cleared.");
    FieldNameSelect.innerHTML = "";
}

function audioError(e) {
    console.log(`Audio error: ${e}`);
    updateStatus(e);
    clearAudio();
}

function cardError(e) {
    console.log(`Card error: ${e}`);
    updateStatus(e);
    clearAudio();
    clearCardInfo();
}

function userInfoChanged() {
    localStorage.setItem('FieldNameSelect.value', FieldNameSelect.value);
    getAudioFilename();
}

async function retrieveAudio(filename) {
    try {
        const result = await util.ankiConnectInvoke("retrieveMediaFile", 6, { filename });

        if (!result) {
            updateStatus("Audio file not found");
            return;
        }

        const audioBlob = atob(result); // Decode base64
        const audioBuffer = new Uint8Array(audioBlob.length).map((_, i) => audioBlob.charCodeAt(i));
        const audioUrl = URL.createObjectURL(new Blob([audioBuffer], { type: "audio/mp3" }));

        WS.load(audioUrl);
        WS.toggleInteraction(true);
    } catch (e) {
        audioError(e);
    }
}

function getAudioFilename() {
    const fieldName = FieldNameSelect.value;
    const fieldValue = _.get(CurrentCard, ["fields", fieldName, "value"]);

    try {
        const matches = fieldValue.match(RegExp(util.audioFileRegex));
        console.log(`Detected audio file: ${matches}`);
        if (_.isEmpty(matches)) {
            throw new Error("No audio file detected");
        }
        retrieveAudio(matches[0]);
        updateStatus(`Fetched audio: ${matches[0]}`);
    } catch (e) {
        audioError(e);
    }
}

function populateFieldNames() {
    console.log("Repopulating field names dropdown.");
    const previousFieldName = FieldNameSelect.value;
    const savedFieldName = localStorage.getItem('FieldNameSelect.value');

    let optionsHTML = "";
    for (const field of Object.keys(CurrentCard.fields)) {
        let selected = "";
        if (field === previousFieldName || field === savedFieldName) {
            console.log(`Reselecting field: "${field}".`);
            selected = "selected";
        }
        optionsHTML += `<option value="${field}" ${selected}>${field}</option>`;
    }

    FieldNameSelect.innerHTML = optionsHTML;
}

let CurrentCard = { "cardId": null };
async function fetchCurrentCard() {
    try {
        const newCard = await util.ankiConnectInvoke("guiCurrentCard", 6);
        if (!newCard || newCard.cardId === CurrentCard.cardId) return;
        console.log("New card fetched.");
        CurrentCard = newCard;
        updateStatus(`Card with ID ${CurrentCard.cardId} fetched`);
        populateFieldNames();
        getAudioFilename();
    } catch (e) {
        console.log("No card found.");
        CurrentCard = { "cardId": null };
        cardError(e);
    }
}

setInterval(fetchCurrentCard, 200);
