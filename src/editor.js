import React from 'react';

class Editor extends React.Component {
    state = {
      children: null,
    }
    constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
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
      for (var i=0; i < pageData.recognizedParagraphs.length; i++) {
        console.log([i, children]);
        const paragraph = pageData.recognizedParagraphs[i];
        var lineElements = [];
        for (var j=0; j< paragraph.lines.length; j++) {
          lineElements.push(<div>{paragraph.lines[j].text}</div>);
        }
        var value = <p>{lineElements}</p>;
        console.log(value);
        children.push(value);
      }
      this.setState({
        children: children
      });
      console.log(children)
      // const paragraphs = 
      // for (var i=0; i <  )
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
        </div>
      );
    }
}

export default Editor;