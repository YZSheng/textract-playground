import { PDFDocument, rgb } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
import fs from "fs";

const translatePosition = (size, x, y, width, height) => {
  const translatedX = x * size.width;
  const translatedY = (1 - y - height) * size.height + height;
  return {
    x: translatedX,
    y: translatedY,
    width: width * size.width,
    height: height * size.height
  }
}

async function replaceTextInPdf(pdfBuffer, x, y, width, height, newText) {
  const fontBytes = fs.readFileSync("./han_sans_cn_light.otf");
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);
  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const size = firstPage.getSize()
  const translated = translatePosition(size, x, y, width, height);
  // Draw a white rectangle over the text you want to replace
  firstPage.drawRectangle({
    x: translated.x,
    y: translated.y,
    width: translated.width,
    height: translated.height,
    color: rgb(1, 1, 1),
  });

  // Draw new text over the rectangle
  firstPage.drawText(newText, {
    x: translated.x,
    y: translated.y,
    size: 16,
    font: customFont
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const replaced = await pdfDoc.save();
  fs.writeFileSync('replaced.pdf', replaced);
}

// Read from S3 instead

const pdf = fs.readFileSync("./one_pager_summary.pdf");
const blocks = fs.readFileSync("./blocks.txt");
const parsedBlocks = JSON.parse(blocks).filter(b => b.BlockType === 'LINE');
// console.log(JSON.parse(blocks));
// replaceTextInPdf(
//   pdf,
//   0.20932289958000183,
//   0.0532037615776062,
//   0.5827662348747253,
//   0.025054512545466423,
//   "如何撰写执行摘要"
// );

const phrases = fs.readFileSync("./phrases.txt", 'utf-8').split("\n");
const translatedPhrases = fs.readFileSync("./translated_phrases.txt", "utf-8").split("\n");
const zipped = phrases.reduce((acc, cur) => {
  const i = phrases.indexOf(cur);
  acc[cur] = translatedPhrases[i];
  return acc;
}, {});

fs.writeFileSync("zipped_translation.txt", JSON.stringify(zipped));