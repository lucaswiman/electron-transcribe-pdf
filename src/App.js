import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PdfJsLib from 'pdfjs-dist';
import MyPdfViewer  from './pdf.js';
import loadModels from './storage.js';

const fs = window.require('fs');
const remote = window.require('electron').remote;
const Sequelize = window.require('sequelize');


const dialog = remote.dialog;

class App extends Component {
  state = {
    renderedPDF: null,
    db: null,
    hiddenCanvas: null,
    recognitionStatus: null,
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          {this.state.recognitionStatus}
        </p>
        <a onClick={this.openFile}>Load</a>
        {this.state.renderedPDF}
        {this.state.hiddenCanvas}
      </div>
    );
  }

  openFile = async () => {
    const fileNames = dialog.showOpenDialog({properties: ['openFile']});
    if (typeof fileNames === 'undefined') {
      return;
    }
    const fileName = fileNames[0];
    return this.renderPDF(fileName);
  }

  componentDidMount = () => {
    this.renderPDF('/tmp/foo.ebook');
  }

  handleRecognition = async (pdfData) => {
    this.setState({'hiddenCanvas': <canvas id="hiddenCanvas" />});
    const pdf = await PdfJsLib.getDocument(pdfData.data);
    for (var i=1; i <= pdf.numPages; i++) {
      console.log(`page ${i}`);
    }
  }

  renderPDF = async (fileName) => {
    var pdfData, buffer, models, connection;
    if (fileName.endsWith('.pdf')) {
      buffer = fs.readFileSync(fileName);
      connection = new Sequelize('database', '', '', {
        'dialect': 'sqlite',
        'storage': '/tmp/foo.ebook',
      });
      const models = loadModels(connection);
      await connection.sync();
      await models.PDFData.create({
        name: fileName,
        data: buffer,
      });
      pdfData = await models.PDFData.findOne();
    } else if (fileName.endsWith('.ebook')) {
      connection = new Sequelize('database', '', '', {
        'dialect': 'sqlite',
        'storage': fileName,
      });
      const models = loadModels(connection);
      pdfData = await models.PDFData.findOne();
      buffer = pdfData.data;
    } else {
      alert(`Could not handle ${fileName}; unknown extension. Should be either .pdf or .ebook`)
      return;
    }
    this.setState({
      db: connection,
      models: models,
    });
  this.handleRecognition(pdfData);

    this.setState({renderedPDF: <MyPdfViewer file={pdfData.data} />});
  };
}

export default App;
