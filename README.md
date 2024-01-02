# Anki Audio Lab

Note: *very* early stages of development.

## AnkiConnect Configuration

To use this tool, you need to configure AnkiConnect as follows:

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


## Third-Party Licenses

This project uses some example code provided by third party libraries:

- From [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js):
    - [pitch-worker.js](https://github.com/katspaugh/wavesurfer.js/blob/main/examples/pitch-worker.js)
    - [Provided example code](https://wavesurfer.xyz/examples/?pitch.js)
- For detailed license terms, refer to the `LICENSE-third-party` file in this repository.
