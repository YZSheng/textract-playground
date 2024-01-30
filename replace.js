import { PDFDocument, rgb } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
import fs from "fs";

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
  const xInPixel = x * size.width;
  const yInPixel = (1 - y - height) * size.height
  // Draw a white rectangle over the text you want to replace
  firstPage.drawRectangle({
    x: xInPixel,
    y: yInPixel + height,
    width: width * size.width,
    height: height * size.height,
    color: rgb(1, 1, 1),
  });

  // Draw new text over the rectangle
  firstPage.drawText(newText, {
    x: xInPixel,
    y: yInPixel + height,
    size: 16,
    font: customFont
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const replaced = await pdfDoc.save();
  fs.writeFileSync('replaced.pdf', replaced);
}

// Read from S3 instead

const pdf = fs.readFileSync("./one_pager_summary.pdf");
replaceTextInPdf(
  pdf,
  0.20932289958000183,
  0.0532037615776062,
  0.5827662348747253,
  0.025054512545466423,
  "如何撰写执行摘要"
);
