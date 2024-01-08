# Anki Audio Lab

![Screenshot](https://github.com/genericdave/anki-audio-lab/blob/main/img/Screenshot.jpg?raw=true)

Anki Audio Lab allows you to deeply inspect any audio files as you're studying them in your Anki flashcards. It allows you to see the waveform, isolate & repeat snippets, vary the playback speed, and view the colorized spectrogram.

The only prerequisites are AnkiConnect and an up-to-date Chrome-based browser. *Note: while other browsers may or may not work, this tool has mainly been tested using a Chrome-based browser.*

## AnkiConnect Configuration

Before using this tool, you need to configure AnkiConnect as follows:

1. Open Anki.
2. Navigate to `Tools` > `Add-ons`.
3. Select `AnkiConnect` from the list and click `Config`.
4. In the configuration pop-up, add the following URL to the `webCorsOriginList`:
    ```
    https://genericdave.github.io
    ```

The final configuration should resemble the following JSON structure:
```json
{
    "apiKey": null,
    "apiLogPath": null,
    "ignoreOriginList": [],
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOriginList": [
        "http://localhost",
        "https://genericdave.github.io"
    ]
}
```


## Displaying Card Audio

1. After configuring AnkiConnect, go to [Anki Audio Lab](https://genericdave.github.io/anki-audio-lab/) in a Chrome-based browser.
2. Open Anki and start reviewing cards. A card must be displayed for review before it will load.
3. In Anki Audio Lab, click the the `Audio Field Name` dropdown and select the flashcard field that contains the audio you want to load. If the spectrogram appears to be vertically stretched, reload the page.


## Usage Instructions

* Click to change the playhead's location.
* Click and drag to select a region. Click outside a region to deselect it. Click an already existing region to select it and play it.
* **Keyboard Shortcuts:**
    * Space: Play/Pause
    * Left/Right Arrow Keys: Skip Back/Forward
    * Up/Down Arrow Keys: Increase/Decrease Playback Rate
    * Left/Right Brackets [ ]: Jump to Start/End
    * P Key: Toggle Preserve Pitch
    * Backspace/Delete: Remove Currently Selected Region


## Techniques For Learning Pronunciation, Pitch, Prosody, etc.

- Reduce the audio speed. It may be useful to turn off the `maintain pitch` setting in order to make the playback smoother.
- Isolate any sections that contain sounds that are difficult to hear or say. You can isolate all the way down to a single phoneme at a time. Shadow the isolated sections, then expand your selection as you start to be able to hear and imitate the sounds accurately.
- Look at the overall movement of the vocal frequencies on the spectrogram, especially the ones near the bottom. Which way are they trending? Do the visual rises and falls correspond with the speaker's rises and falls in pitch? Compare and contrast with the waveform, which shows the loudness of the sound, regardless of pitch.


## Why Not Visualize Pitch?

I originally intended to visualize pitch in this project in order to help learners of pitch-accented languages. However, after implementing pitch detection using [pitchfinder](https://github.com/peterkhayes/pitchfinder), I found that it was unable to extract any meaningful pitch data at all for a lot of real-world audio. In the cases where it did detect pitch, it was usually not detailed and accurate enough to actually see the quick, nuanced pitch changes of a pitch-accent language like Japanese. It was generally limited to visualizing the large, obvious pitch changes associated with expressing emotion.

Having an unreliable and inaccurate visual representation of pitch is both distracting and misleading. In the end, pitch is something you need to train your *ears* to recognize. If you want a fully accurate visual representation of the sound, please use the spectrogram feature and learn to interpret it.


## Building

- Install [Node.js.](https://nodejs.org/en)
- Clone the repo and install the dependencies:
    ```sh
    npm install
    ```
- Build the project, placing built files in the `docs` directory. This allows uploading to someplace like Github Pages:
    ```sh
    npm run build
    ```
- Or run a local server to host the files for development and local use:
    ```sh
    npm start
    ```
    - If you want to use Anki Audio Lab locally, you will need to add `http://localhost:1234` to the `webCorsOriginList` in the AnkiConnect configuration. See [AnkiConnect Configuration](#ankiconnect-configuration) for more details.


## Third-Party Licenses

This project uses third party libraries:

- [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js)
- [lodash](https://github.com/lodash/lodash)
- [Bootstrap](https://github.com/twbs/bootstrap)
- [colormap](https://github.com/bpostlethwaite/colormap)
- For detailed license terms, refer to the `LICENSE-third-party` file in this repository.
