import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PdfJsLib from 'pdfjs-dist';
import Editor from './editor.js';
import loadModels from './storage.js';
import TesseractProcessor from './tesseract-processor.js';

const fs = window.require('fs');
const remote = window.require('electron').remote;
const Sequelize = window.require('sequelize');
const Tesseract = window.Tesseract;


const dialog = remote.dialog;

class App extends Component {
  state = {
    renderedPDF: null,
    db: null,
    hiddenCanvas: null,
    recognitionStatus: null,
    models: null,
  };
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          {this.state.recognitionStatus}
        </p>
        <a onClick={this.openFile}>Load</a>
        {this.state.editor}
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
    if (fs.existsSync('/tmp/foo.ebook')) {
      this.renderPDF('/tmp/foo.ebook');
    }
  }

  handleRecognition = async (pdfData) => {
    this.setState({'hiddenCanvas': <canvas id="hiddenCanvas" />});
    const pdf = await PdfJsLib.getDocument(pdfData.data);
    const canvas = document.getElementById('hiddenCanvas');  // This is probably a react no-no, but whatevs.
    const canvasContext = canvas.getContext('2d');

    const promiseToRecognize = (blob, pageNumber) => {
      // Make Tesseract behave in a promise-ish sort of way: https://github.com/naptha/tesseract.js/issues/120
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
        .then(result => {
          window.pageToParagraphs[pageNumber] = TesseractProcessor.processParagraphs(result.paragraphs);
          resolve(result);
        })
      });
    }
    var numRecognizedPages = 0;
    const existingPageData = await this.state.models.Page.findAll({
      attributes: ['pageNumber'],
      where: {
        pdfdatumId: pdfData.id,
      }
    });
    const existingPageNumbers = new Set();
    for (var i=1; i< existingPageData.length; i++) {
      existingPageNumbers.add(existingPageData[i].pageNumber);
    }
    for (var pageNumber=1; pageNumber <= pdf.numPages; pageNumber++) {
      if (!existingPageNumbers.has(pageNumber)) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport(2);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext,
          viewport,
        };
        await page.render(renderContext);
        // Canvas.toBlob also doesn't use the Promise API.
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob(function(blob) {
            resolve(blob)
          });
        });
        const recognitionResult = await promiseToRecognize(blob, pageNumber);
        this.state.models.Page.create({
          pdfdatumId: pdfData.id,
          pageNumber: pageNumber,
          recognizedParagraphs: TesseractProcessor.processParagraphs(recognitionResult.paragraphs),
        });
        numRecognizedPages += 1;
      }
      if (pageNumber == 39) {
        const pageData = await this.state.models.Page.findOne({
          where: {
            pdfdatumId: pdfData.id,
            pageNumber: 39,
          }
        });
        this.setState({
          editor: <Editor pageData={pageData} pdf={pdf} />
        });
      }
    }
    if (numRecognizedPages === pdf.numPages) {
      this.setState({
        recognitionStatus: `Recognized ${pdf.numPages} page(s).`,
      });
    } else if (numRecognizedPages == 0) {
      this.setState({
        recognitionStatus: `Loaded recognition data for ${pdf.numPages} pages`,
      });
    } else {
      this.setState({
        recognitionStatus: `Loaded recognition data for ${pdf.numPages - numRecognizedPages} and recognized the remaining ${numRecognizedPages} pages.`,
      });

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
      models = loadModels(connection);
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
      models = loadModels(connection);
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
  };
}

export default App;
