import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PdfJsLib from 'pdfjs-dist';
import MyPdfViewer  from './pdf.js';
import loadModels from './storage.js';

const fs = window.require('fs');
const remote = window.require('electron').remote;
const Sequelize = window.require('sequelize');
const Tesseract = window.Tesseract;


const dialog = remote.dialog;

function getCanvasBlob(canvas) {
  // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
  return new Promise(function(resolve, reject) {
    canvas.toBlob(function(blob) {
      resolve(blob)
    })
  })
}


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
    const canvas = document.getElementById('hiddenCanvas');  // This is probably a react no-no, but whatevs.
    console.log(canvas);
    const canvasContext = canvas.getContext('2d');
    window.pageToResults = {}
    const promiseToRecognize = (blob, pageNumber) => {
      return new Promise((resolve, reject) => {
        Tesseract.recognize(blob)
        .progress((message) => {
          this.setState({
            recognitionStatus: `Recognizing page ${pageNumber}: ${message.status} (${Math.round(100 * message.progress)}%)`,
          });
        })
        .catch(err => {
          console.error(err);
          reject(err);
        })
        .then(result => resolve(result))
        .finally(resultOrError => {
          window.pageToResults[pageNumber] = resultOrError;
        })
      });
    }
    for (var pageNumber=1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport(2);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext,
        viewport,
      };
      await page.render(renderContext);
      const blob = await getCanvasBlob(canvas);
      const recognitionResult = await promiseToRecognize(blob, pageNumber);
      console.log(recognitionResult);
    }
    this.setState({
      recognitionStatus: `Recognized ${pdf.numPages} page(s).`,
    });
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
