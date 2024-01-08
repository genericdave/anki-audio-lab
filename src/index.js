import _ from "lodash";
// import bootstrap from 'bootstrap'
import * as util from "./util.js";

// Config
const rateDelta = 0.2;
const MaxRate = 2;
const MinRate = 0.2;
const skipDelta = 0.5;


// Elements
const StatusText = document.getElementById("status-text");
const FieldNameSelect = document.getElementById("field-name-select");
const PlaybackDisplay = document.getElementById("playback-display");


// Events
FieldNameSelect.addEventListener("change", userInfoChanged);

document.addEventListener('keydown', function (event) {
    let shouldPreventDefault = true;

    switch (event.code) {
        case 'Space':
            util.WS.playPause();
            break;
        case 'ArrowLeft':
            util.WS.skip(-skipDelta);
            break;
        case 'ArrowRight':
            util.WS.skip(skipDelta);
            break;
        case 'ArrowUp':
            // Increase playback speed.
            const upRate = Math.min(util.WS.getPlaybackRate() + rateDelta, MaxRate).toFixed(1);
            util.WS.setPlaybackRate(Number(upRate));
            PlaybackDisplay.innerText = upRate;
            break;
        case 'ArrowDown':
            // Decrease playback speed.
            const downRate = Math.max(util.WS.getPlaybackRate() - rateDelta, MinRate).toFixed(1);
            util.WS.setPlaybackRate(Number(downRate));
            PlaybackDisplay.innerText = downRate;
            break;
        case 'BracketLeft':
            // Jumpt to start.
            util.WS.seekTo(0);
            break;
        case 'BracketRight':
            // Jump to end.
            util.WS.seekTo(1);
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
    util.WS.empty();
    util.WS.toggleInteraction(false);
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

        util.WS.load(audioUrl);
        util.WS.toggleInteraction(true);
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
