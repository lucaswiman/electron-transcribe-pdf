import {convertToRaw, ContentState, EditorState} from 'draft-js';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';

const processSymbol = (symbol) => {
  return {
    baseline: symbol.baseline,
    bbox: symbol.bbox,
    choices: symbol.choices,
    confidence: symbol.confidence,
    is_dropcap: symbol.is_dropcap,
    is_superscript: symbol.is_superscript,
    text: symbol.text,
  };
};


const processWord = (word) => {
  return {
    baseline: word.baseline,
    bbox: word.bbox,
    choices: word.choices,
    confidence: word.confidence,
    direction: word.direction,
    font_id: word.font_id,
    font_name: word.font_name,
    font_size: word.font_size,
    in_dictionary: word.in_dictionary,
    is_bold: word.is_bold,
    is_italic: word.is_italic,
    is_monospace: word.is_monospace,
    is_numeric: word.is_numeric,
    is_serif: word.is_serif,
    is_smallcaps: word.is_smallcaps,
    is_underlined: word.is_underlined,
    language: word.language,
    text: word.text,
    symbols: word.symbols.map(processSymbol),
  };
}

const processLine = (line) => {
  return {
    words: line.words.map(processWord),
    text: line.text,
    confidence: line.confidence,
    baseline: line.baseline,
    bbox: line.bbox,
  };
}

const processParagraph = (paragraph) => {
    return {
        lines: paragraph.lines.map(processLine),
        text: paragraph.text,
        confidence: paragraph.confidence,
        baseline: paragraph.baseline,
        bbox: paragraph.bbox,
    };
};

export default {
  processParagraphs: (paragraphs) => {
    return paragraphs.map(processParagraph);
  },
  serializePageRecognition: (recognitionResult) => {
    return JSON.stringify(recognitionResult.paragraphs.map(processParagraph));
  },
  lineToDraftEditorState: (tesseractLine) => {
    const htmlWords = [];
    var lineHtml = '<span>';
    for (var i=0; i<tesseractLine.words.length; i++) {
      const word = tesseractLine.words[i];
      var isSuperscript = false;
      if (i !== 0) {
        lineHtml += ' ';
      }
      for (var j=0; j<word.symbols.length; j++) {
        const symbol = word.symbols[j];
        if (symbol.is_superscript && (symbol.is_superscript !== isSuperscript)) {
          lineHtml += '<sup>';
          isSuperscript = true;
        } else if (isSuperscript && !symbol.is_superscript) {
          lineHtml += '</sup>';
          isSuperscript = false;
        }
        lineHtml += symbol.text;
      }
      if (isSuperscript) {
        isSuperscript = false;
        lineHtml += '</sup>'
      }
    }
    lineHtml += '</span>';
    console.log([lineHtml, DraftPasteProcessor.processHTML(lineHtml)]);
    return EditorState.createWithContent(ContentState.createFromBlockArray(DraftPasteProcessor.processHTML(lineHtml)));
  },
};