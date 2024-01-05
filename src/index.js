// Init
import WaveSurfer from 'wavesurfer.js';

const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'rgba(200, 200, 200, 0.5)',
    progressColor: 'rgba(100, 100, 100, 0.5)',
    minPxPerSec: 200,
    sampleRate: 11025,
});


// Functions
function acInvoke(action, version, params = {}) {
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

async function queryAudio() {
    const cardData = await fetchCurrentCard();
    if (cardData) {
        displayCardInfo(cardData);
    }
}

async function retrieveAndPlayAudio(filename) {
    try {
        const result = await acInvoke('retrieveMediaFile', 6, { filename });
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

async function fetchCurrentCard() {
    try {
        const result = await acInvoke('guiCurrentCard', 6);
        return result;
    } catch (e) {
        updateStatus('Error: ' + e);
        return null;
    }
}


// View update
const statusElement = document.getElementById('status');
const fieldNameSelect = document.getElementById('field-name-select');
const regexPatternInput = document.getElementById('regex-pattern-input');
const cardFieldsElement = document.getElementById('card-fields');

fieldNameSelect.addEventListener('change', queryAudio);
regexPatternInput.addEventListener('input', queryAudio);
wavesurfer.on('interaction', wavesurfer.playPause);

function updateStatus(message) {
    statusElement.textContent = message;
}

function populateFieldNames(cardData) {
    const currentSelection = fieldNameSelect.value;
    fieldNameSelect.innerHTML = '';

    for (const field of Object.keys(cardData.fields)) {
        const option = document.createElement('option');
        option.value = field;
        option.textContent = field;
        fieldNameSelect.appendChild(option);
    }

    // Check if the previously selected field exists in the new fields
    if (cardData.fields.hasOwnProperty(currentSelection)) {
        fieldNameSelect.value = currentSelection; // Set the previously selected field
    }
}


// Main
async function main() {
    let lastCardId = null;
    async function pollForNewCard() {
        const cardData = await fetchCurrentCard();

        const noUpdateNeeded = !cardData || cardData.cardId === lastCardId;
        if (noUpdateNeeded) return;

        updateStatus('Card with ID ' + cardData.cardId + ' fetched');
        lastCardId = cardData.cardId;
        populateFieldNames(cardData);
        displayCardInfo(cardData);
    }

    setInterval(pollForNewCard, 200);
}

main();
