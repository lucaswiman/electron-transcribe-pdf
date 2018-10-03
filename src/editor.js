import React from 'react';
import {Editor as DraftJSEditor, EditorState, RichUtils} from 'draft-js';

import TesseractProcessor from './tesseract-processor.js';

class WordEditor extends React.Component {
  // TODO superscript and other styling https://stackoverflow.com/a/40966563/303931
  constructor(props) {
    super(props);
    this.state = {editorState: TesseractProcessor.wordToDraftEditorState(this.props.word)};
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }
  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
  render() {
    return (
      <DraftJSEditor
        editorState={this.state.editorState}
        handleKeyCommand={this.handleKeyCommand}
        onChange={this.onChange}
      />
    );
  }
}

class LineEditor extends React.Component {
  constructor(props) {
    super(props);
    const words = this.props.line.words;
    const renderedWords = [];
    for (var i=0; i < words.length; i++) {
      const word = words[i];
      renderedWords.push(
        <WordEditor word={word} key={`editable-word-${i}`} />
      );
    }
    this.state = {'words': renderedWords};
  }
  render() {
    return (
      <div className="word-editable-line">
        {this.state.words}
      </div>
    );
  }
}

class Editor extends React.Component {
    state = {
      children: null,
    }
    constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
      this.lineCanvasRef = React.createRef();
    }

    renderPage = async () => {
      const children = [];
      const pageData = this.props.pageData;
      const page = await this.props.pdf.getPage(pageData.pageNumber);
      const viewport = page.getViewport(2);
      const canvas = this.canvasRef.current
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const canvasContext = canvas.getContext('2d');
      await page.render({
        canvasContext,
        viewport,
      });
      window.pageData = pageData;
      const lineCanvas = this.lineCanvasRef.current;
      for (var i=0; i < pageData.recognizedParagraphs.length; i++) {
        const paragraph = pageData.recognizedParagraphs[i];
        var lineElements = [];
        for (var j=0; j< paragraph.lines.length; j++) {
          const line = paragraph.lines[j];
          
          const imageData = canvasContext.getImageData(
            0,
            line.bbox.y0,
            canvas.width,
            line.bbox.y1 - line.bbox.y0);
          lineCanvas.height = line.bbox.y1 - line.bbox.y0;
          lineCanvas.width = canvas.width;
          const lineCtx = lineCanvas.getContext('2d');
          lineCtx.putImageData(imageData, 0, 0);
          lineElements.push(
            <img src={lineCanvas.toDataURL('image/png')}
                 key={`${pageData.pageNumber}-original-paragraph-${i}-line-${j}`}/>
          );
          lineElements.push(
            <LineEditor line={line} key={`text-paragraph-${i}-line-${j}`}/>
          );
        }
        var value = <div key={`page-${pageData.pageNumber}-paragraph-${i}`}>{lineElements}</div>;
        children.push(value);
      }
      this.setState({
        children: children
      });
    }
    componentDidMount() {
      this.renderPage();
    }
    // componentWillReceiveProps = (newProps) => {  // TODO

    render = () => {
      window.foo = this.props
      return (
        <div ref={(container) => {this.container = container; }}>
          {this.state.children}
          <canvas style={{display: 'none'}} ref={this.canvasRef} />
          <canvas style={{display: 'none'}} ref={this.lineCanvasRef} />
        </div>
      );
    }
}

export default Editor;