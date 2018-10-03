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
  wordToDraftEditorState: (tesseractWord) => {
    let wordHtml = '';
    let isSuperscript = false;
    for (var j=0; j<tesseractWord.symbols.length; j++) {
      const symbol = tesseractWord.symbols[j];
      if (symbol.is_superscript && (symbol.is_superscript !== isSuperscript)) {
        wordHtml += '<sup>';
        isSuperscript = true;
      } else if (isSuperscript && !symbol.is_superscript) {
        wordHtml += '</sup>';
        isSuperscript = false;
      }
      wordHtml += symbol.text;
    }
    if (isSuperscript) {
      isSuperscript = false;
      wordHtml += '</sup>'
    }
    console.log([wordHtml, DraftPasteProcessor.processHTML(wordHtml)]);
    return EditorState.createWithContent(ContentState.createFromBlockArray(DraftPasteProcessor.processHTML(wordHtml)));
  },
};