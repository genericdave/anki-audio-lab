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


// Functions
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

function displayCardInfo(cardData) {
    // Displaying the card fields as formatted JSON
    cardFieldsElement.textContent = JSON.stringify(cardData.fields, null, 4); // Indents with 4 spaces

    // Extracting field name and regex pattern from user input
    const fieldName = fieldNameSelect.value;
    const regexPattern = regexPatternInput.value;

    // Checking if the field exists and applying regex to extract audio filename
    if (fieldName && cardData.fields[fieldName] && regexPattern) {
        const fieldValue = cardData.fields[fieldName].value;
        const regex = new RegExp(regexPattern);
        const matches = fieldValue.match(regex);

        // Using the first captured group from regex
        if (matches && matches[1]) {
            updateStatus('Audio fetched from card with ID ' + cardData.cardId);
            retrieveAndPlayAudio(matches[1]); // Using the extracted audio filename
        } else {
            updateStatus('No matching audio file found');
        }
    } else {
        updateStatus('Field not found or invalid regex pattern');
    }
}


// View update
const statusElement = document.getElementById('status');
const fieldNameSelect = document.getElementById('field-name-select');
const regexPatternInput = document.getElementById('regex-pattern-input');
const cardFieldsElement = document.getElementById('card-fields');

wavesurfer.on('interaction', wavesurfer.playPause);

function updateStatus(message) {
    statusElement.textContent = message;
}

function populateFieldNames(cardData) {
    const previousSelection = fieldNameSelect.value;

    let optionsHTML = "";
    for (const field of Object.keys(cardData.fields)) {
        optionsHTML += `<option value="${field}" ${field === previousSelection ? 'selected' : ''}}>${field}</option>`;
    }

    fieldNameSelect.innerHTML = optionsHTML;
}

async function fetchCurrentCard() {
    try {
        return await ankiConnectInvoke('guiCurrentCard', 6);
    } catch (e) {
        updateStatus('Error: ' + e);
        return;
    }
}


// Main
async function main() {
    let lastCardId = null;
    let lastSelectedField = null;
    async function pollForNewCard() {
        const cardData = await fetchCurrentCard();
        if (!cardData) {
            // No card available, so unload audio and card data.
        } else if (cardData.cardId === lastCardId) {
            // Card didn't change, so do nothing.
            return;
        }

        // TODO: Add a check to see if the newly selected field from
        // populateFieldNames is different from lastSelectedField. If so, we
        // should update, even if cardId hasn't changed. populateFieldNames
        // needs to return the proper data.

        lastCardId = cardData.cardId;
        populateFieldNames(cardData);
        displayCardInfo(cardData);
    }

    setInterval(pollForNewCard, 200);
}

main();
