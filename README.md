# Anki Audio Lab

Note: *very* early stages of development.

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


## Using Anki Audio Lab

1. After configuring AnkiConnect, go to [Anki Audio Lab](https://genericdave.github.io/anki-audio-lab/) in your browser.
2. Open Anki and start reviewing cards.
3. Select the field in the flashcard that contains the audio you want to load from the `Audio Field Name` dropdown.
4. As long as the field contains audio in the standard `[sound:filename.mp3]` format, the audio should load automatically.
    - If for some reason, you load audio files using a different format, change the regex in the `Audio File Pattern` text box to match your audio field, ensuring that the complete filename is surrounded in parentheses. The first matched group (the pattern in parentheses) will be used as the filename in order to request the audio file from AnkiConnect.


## Building

- Install [Node.js.](https://nodejs.org/en)
- Install the dependencies:
    ```sh
    npm install
    ```
- Build the project:
    ```sh
    npm run build
    ```
- Or build the project and run a server to host the files:
    ```sh
    npm start
    ```
- If you want to use it locally, you will need to add `http://localhost:1234` to the `webCorsOriginList` in the AnkiConnect configuration. See [AnkiConnect Configuration](#ankiconnect-configuration) for more details.
- Built files will be placed in the `docs` directory.


## Techniques For Learning Pronunciation, Pitch, Prosody, etc.

- Reduce the audio speed. It may be useful to turn off the `maintain pitch` setting in order to make the playback smoother. 
- Isolate any sections that contain sounds that are difficult to hear or say. You can isolate all the way down to a single phoneme at a time. Shadow the isolated section, then expand your selection as you start to be able to hear and imitate the sounds accurately.
- Use the record feature to compare your shadowing to the native speaker audio.


## Why Not Visualize Pitch?

I originally intended to visualize pitch in this project in order to help learners of pitch-accented languages. However, after implementing pitch detection using [pitchfinder](https://github.com/peterkhayes/pitchfinder), I found that it was unable to extract any meaningful pitch data at all for a lot of real-world audio. In the cases where it did detect pitch, it was usually not detailed and accurate enough to actually see the quick, nuanced pitch changes of a pitch-accent language like Japanese. It was generally limited to visualizing the large, obvious pitch changes associated with expressing emotion.

Having an unreliable and inaccurate visual representation of pitch is both distracting and misleading. In the end, pitch is something you need to train your *ears* to recognize. If you want a fully accurate visual representation of the sound, please use the spectrogram feature and learn to interpret it.


## Third-Party Licenses

This project uses third party libraries:

- [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js)
- For detailed license terms, refer to the `LICENSE-third-party` file in this repository.
