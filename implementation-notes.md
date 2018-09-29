## ElectronJS with React

Following this tutorial: https://medium.freecodecamp.org/building-an-electron-application-with-create-react-app-97945861647c

- Installed nvm using homebrew with `--no-use` to use a version of node new enough for create-react-app
- run `nvm use node` before working in this directory.

- run `npx create-react-app pdf-transcribe`, which outputted:
```
Success! Created pdf-transcribe at /Users/lwiman/opensource/electron-transcribe-pdf/pdf-transcribe
Inside that directory, you can run several commands:

  npm start
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm test
    Starts the test runner.

  npm run eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd pdf-transcribe
  npm start

Happy hacking!
```

- Run `npm install --save-dev electron`
- `curl https://raw.githubusercontent.com/electron/electron-quick-start/master/main.js > electron-starter.js`