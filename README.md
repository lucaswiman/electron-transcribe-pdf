# electron-transcribe-pdf
Example project to learn electronJS and react by building a PDF transcription application.

## Development

`npm install` currently fails due to some electron sqlite issue that the electron-builder docs say _should_ work but doesn't work for some reason. I'm probably doing something slightly wrong. Manually install each dependency with `npm install dependency --save-dev`

Then in two terminal tabs, run:
- `npm run start`  (Runs the react server electron is running against)
- `npm run electron-dev`  (Runs the electron process)
