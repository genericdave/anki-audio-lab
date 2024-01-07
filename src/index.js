import WaveSurfer from 'wavesurfer.js';
import { ankiConnectInvoke } from "./util.js";

// Init
const wavesurfer = WaveSurfer.create({
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
wavesurfer.on('interaction', wavesurfer.playPause);

// Logic
async function retrieveAndPlayAudio(filename) {
    try {
        const result = await ankiConnectInvoke('retrieveMediaFile', 6, { filename });
        if (result) {
            const audioBlob = atob(result); // Decode base64
            const audioBuffer = new Uint8Array(audioBlob.length).map((_, i) => audioBlob.charCodeAt(i));
            const audioUrl = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mp3' }));

            wavesurfer.load(audioUrl);
            updateStatus('Audio file loaded');
        } else {
            updateStatus('Audio file not found');
        }
    } catch (e) {
        updateStatus('Error: ' + e);
    }
}

function displayCurrentCard() {
    // Displaying the card fields as formatted JSON, indenting with 4 spaces.
    CardFieldsElement.textContent = JSON.stringify(CurrentCard.fields, null, 4);

    const fieldName = FieldNameSelect.value;
    const regexPattern = RegexPatternInput.value;

    // Checking if the field exists and applying regex to extract audio filename
    if (fieldName && CurrentCard.fields[fieldName] && regexPattern) {
        const fieldValue = CurrentCard.fields[fieldName].value;
        const regex = new RegExp(regexPattern);
        const matches = fieldValue.match(regex);
        // Using the first captured group from regex
        if (matches && matches[1]) {
            updateStatus('Audio fetched from card with ID ' + CurrentCard.cardId);
            retrieveAndPlayAudio(matches[1]); // Using the extracted audio filename
        } else {
            updateStatus('No matching audio file found');
        }
    } else {
        updateStatus('Field not found or invalid regex pattern');
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
        // Clear field names
        // Clear card info
        updateStatus('Error: ' + e);
        return;
    }
}

setInterval(fetchCurrentCard, 200);
