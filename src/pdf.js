import React from 'react';
import PdfJsLib from 'pdfjs-dist';
import PropTypes from 'prop-types';

class BufferPDF extends React.Component {
  /* Based on https://github.com/mikecousins/react-pdf-js/blob/master/src/index.js
   * Can accept a buffer rather than a string as the file name and allows for more customization. */
  static propTypes = {
    file: PropTypes.any.isRequired,
    page: PropTypes.number,
    onDocumentComplete: PropTypes.func,
    pageRenderedCallBack: PropTypes.func,
    scale: PropTypes.number,
  }  

  static defaultProps = {
    page: 1,
    onDocumentComplete: null,
    renderedCallBack: null,
    scale: 1.5,
    pageRenderedCallBack: null,
  }

  state = {
    pdf: null,
  };

  componentDidMount() {
    PdfJsLib.getDocument(this.props.file).then((pdf) => {
      this.setState({ pdf });
      if (this.props.onDocumentComplete) {
        this.props.onDocumentComplete(pdf.pdfInfo.numPages);
      }
      this.renderPage(this.props.page);
    });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.page !== this.props.page) {
      this.renderPage(newProps.page);
    }
  }

  renderPage = (page) => {
    this.state.pdf.getPage(page).then((page) => {
      const viewport = page.getViewport(this.props.scale);

      const { canvas } = this;
      const canvasContext = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext,
        viewport,
      };
      const task = page.render(renderContext);
      if (this.props.pageRenderedCallBack) {
        task.promise.then(() => {
          this.props.pageRenderedCallBack(canvas);
        });
      }
    });
  }

  render() {
    return <canvas ref={(canvas) => { this.canvas = canvas; }} />;
  }
}

class MyPdfViewer extends React.Component {
  state = {};
 
  onDocumentComplete = (pages) => {
    this.setState({ page: 1, pages: pages });
  }

  pageRenderedCallBack = (canvas) => {
    canvas.toBlob((blob) => {
      // console.log(blob);
      // console.log(typeof blob);
      // console.log(blob.length);
    });
  }

  handlePrevious = () => {
    this.setState({ page: this.state.page - 1 });
  }
 
  handleNext = () => {
    this.setState({ page: this.state.page + 1 });
  }
 
  renderPagination = (page, pages) => {
    let previousButton = <li className="previous" onClick={this.handlePrevious}><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    if (page === 1) {
      previousButton = <li className="previous disabled"><a href="#"><i className="fa fa-arrow-left"></i> Previous</a></li>;
    }
    let nextButton = <li className="next" onClick={this.handleNext}><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    if (page === pages) {
      nextButton = <li className="next disabled"><a href="#">Next <i className="fa fa-arrow-right"></i></a></li>;
    }
    return (
      <nav>
        <ul className="pager">
          {previousButton}
          {nextButton}
        </ul>
      </nav>
      );
  }
 
  render() {
    let pagination = null;
    if (this.state.pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages);
    }
    return (
      <div>
        <BufferPDF
          file={this.props.file}
          onDocumentComplete={this.onDocumentComplete}
          page={this.state.page}
          pageRenderedCallBack={this.pageRenderedCallBack}
        />
        {pagination}
      </div>
    )
  }
}
 
export default MyPdfViewer;