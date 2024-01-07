import WaveSurfer from 'wavesurfer.js';
import { ankiConnectInvoke } from "./util.js";
const _ = require('lodash');

// Init
const WS = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'rgba(200, 200, 200, 0.5)',
    progressColor: 'rgba(100, 100, 100, 0.5)',
    minPxPerSec: 200,
    sampleRate: 11025,
});


// Elements
const StatusText = document.getElementById('status');
const FieldNameSelect = document.getElementById('field-name-select');
const RegexPatternInput = document.getElementById('regex-pattern-input');
const CardFieldsElement = document.getElementById('card-fields');


// Events
FieldNameSelect.addEventListener('change', displayCurrentCard);
RegexPatternInput.addEventListener('input', displayCurrentCard);
WS.on('interaction', () => {
    WS.playPause();
});


// Logic
function clearAudio() {
    WS.empty();
    WS.toggleInteraction(false);
}

function clearAllCardInfo() {
    clearAudio();
    FieldNameSelect.innerHTML = '';
    CardFieldsElement.textContent = '';
}

async function retrieveAudio(filename) {
    try {
        const result = await ankiConnectInvoke('retrieveMediaFile', 6, { filename });

        if (!result) {
            updateStatus('Audio file not found');
            return;
        }

        const audioBlob = atob(result); // Decode base64
        const audioBuffer = new Uint8Array(audioBlob.length).map((_, i) => audioBlob.charCodeAt(i));
        const audioUrl = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mp3' }));

        WS.load(audioUrl);
        WS.toggleInteraction(true);
        updateStatus('Audio file loaded');
    } catch (e) {
        updateStatus(`Error: ${e}`);
    }
}

function displayCurrentCard() {
    // Displaying the card fields as formatted JSON, indenting with 4 spaces.
    CardFieldsElement.textContent = JSON.stringify(CurrentCard.fields, null, 4);

    const fieldName = FieldNameSelect.value;
    const fieldValue = _.get(CurrentCard, ['fields', fieldName, 'value']);

    try {
        const matches = fieldValue.match(RegExp(RegexPatternInput.value));
        // Using the first captured group from regex to play audio
        retrieveAudio(matches[1]);
        updateStatus(`Audio fetched from card with ID ${CurrentCard.cardId}`);
    } catch (e) {
        updateStatus("Invalid regular expression or no matches");
        clearAudio();
        return;
    }
}

function updateStatus(message) {
    StatusText.textContent = message;
}

function populateFieldNames() {
    const previousSelection = FieldNameSelect.value;

    let optionsHTML = "";
    for (const field of Object.keys(CurrentCard.fields)) {
        optionsHTML += `<option value="${field}" ${field === previousSelection ? 'selected' : ''}}>${field}</option>`;
    }

    FieldNameSelect.innerHTML = optionsHTML;
}

let CurrentCard = { "cardId": null };
async function fetchCurrentCard() {
    try {
        let newCard = await ankiConnectInvoke('guiCurrentCard', 6);
        if (!newCard || newCard.cardId === CurrentCard.cardId) return;
        CurrentCard = newCard;
        updateStatus(`Card with ID ${CurrentCard.cardId} fetched`);
        populateFieldNames();
        displayCurrentCard();
    } catch (e) {
        CurrentCard = { "cardId": null };
        clearAllCardInfo();
        updateStatus(`Error: ${e}`);
        return;
    }
}

setInterval(fetchCurrentCard, 200);
