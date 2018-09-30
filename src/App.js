import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
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
        <a onClick={this.openFile}>Load</a>
        {this.state.renderedPDF}
      </div>
    );
  }

  openFile = async () => {
    const fileNames = dialog.showOpenDialog({properties: ['openFile']});
    if (typeof fileNames == 'undefined') {
      return;
    }
    const fileName = fileNames[0];
    return this.renderPDF(fileName);
  }

  componentDidMount = () => {
    this.renderPDF('/tmp/foo.ebook');
  }
  renderPDF = async (fileName) => {
    var buffer;
    if (fileName.endsWith('.pdf')) {
      buffer = fs.readFileSync(fileName);
      const connection = new Sequelize('database', '', '', {
        'dialect': 'sqlite',
        'storage': '/tmp/foo.ebook',
      });
      const models = loadModels(connection);
      await connection.sync();
      this.setState({
        db: connection,
        models: models,
      });
      await models.PDFData.create({
        name: fileName,
        data: buffer,
      });
      const pdfData = await models.PDFData.findOne();
    } else if (fileName.endsWith('.ebook')) {
      const connection = new Sequelize('database', '', '', {
        'dialect': 'sqlite',
        'storage': fileName,
      });
      const models = loadModels(connection);
      const pdfData = await models.PDFData.findOne();
      buffer = pdfData.data;

    }

    this.setState({renderedPDF: <MyPdfViewer file={buffer} />});
  };
}

export default App;
