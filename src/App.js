import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MyPdfViewer  from './pdf.js';

const fs = window.require('fs');
const remote = window.require('electron').remote;
const dialog = remote.dialog;


class App extends Component {
  state = {
    renderedPDF: null,
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <a onClick={this.renderPDF}>Load</a>
        {this.state.renderedPDF}
      </div>
    );
  }
  renderPDF = () => {
    const fileNames = dialog.showOpenDialog({properties: ['openFile']});
    if (typeof fileNames == 'undefined') {
      return;
    }
    const fileName = fileNames[0];
    console.log(fileName);
    window.yourMom = fs;
    const buffer = fs.readFileSync(fileName);

    this.setState({renderedPDF: <MyPdfViewer file={buffer} />});
  };
}

export default App;
