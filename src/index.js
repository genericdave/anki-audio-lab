import _ from "lodash";
import WaveSurfer from "wavesurfer.js";
import { ankiConnectInvoke } from "./util.js";


// Elements
const StatusText = document.getElementById("status");
const FieldNameSelect = document.getElementById("field-name-select");
const RegexPatternInput = document.getElementById("regex-pattern-input");
const CardFieldsElement = document.getElementById("card-fields");


// Init
const savedRegex = localStorage.getItem('RegexPatternInput.value');
if (savedRegex) RegexPatternInput.value = savedRegex;

const WS = WaveSurfer.create({
    container: "#waveform",
    waveColor: "rgba(200, 200, 200, 0.5)",
    progressColor: "rgba(100, 100, 100, 0.5)",
    minPxPerSec: 200,
    sampleRate: 11025,
});


// Events
FieldNameSelect.addEventListener("change", userInfoChanged);
RegexPatternInput.addEventListener("input", userInfoChanged);
WS.on("interaction", () => { WS.playPause(); });


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
    CardFieldsElement.textContent = "";
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
    localStorage.setItem('RegexPatternInput.value', RegexPatternInput.value);
    displayCurrentCard();
}

async function retrieveAudio(filename) {
    try {
        const result = await ankiConnectInvoke("retrieveMediaFile", 6, { filename });

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

function displayCurrentCard() {
    // Displaying the card fields as formatted JSON, indenting with 4 spaces.
    CardFieldsElement.textContent = JSON.stringify(CurrentCard.fields, null, 4);

    const fieldName = FieldNameSelect.value;
    const fieldValue = _.get(CurrentCard, ["fields", fieldName, "value"]);

    try {
        const matches = fieldValue.match(RegExp(RegexPatternInput.value));
        if (!matches || matches.length < 2) {
            throw new Error("No audio file matched");
        }
        // Using the first captured group from regex to play audio
        retrieveAudio(matches[1]);
        updateStatus(`Audio fetched from card with ID ${CurrentCard.cardId}`);
    } catch (e) {
        audioError(e);
    }
}

function populateFieldNames() {
    console.log("Repopulating field names dropdown.");
    const previousSelection = FieldNameSelect.value;
    const savedFieldName = localStorage.getItem('FieldNameSelect.value');

    let optionsHTML = "";
    for (const field of Object.keys(CurrentCard.fields)) {
        let selected = "";
        if (field === previousSelection || field === savedFieldName) {
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
        const newCard = await ankiConnectInvoke("guiCurrentCard", 6);
        if (!newCard || newCard.cardId === CurrentCard.cardId) return;
        console.log("New card fetched.");
        CurrentCard = newCard;
        updateStatus(`Card with ID ${CurrentCard.cardId} fetched`);
        populateFieldNames();
        displayCurrentCard();
    } catch (e) {
        console.log("No card found.");
        CurrentCard = { "cardId": null };
        cardError(e);
    }
}

setInterval(fetchCurrentCard, 200);
