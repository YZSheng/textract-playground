import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";

const translatePosition = (size, x, y, width, height) => {
  const translatedX = x * size.width;
  const translatedY = (1 - y - height) * size.height + height;
  return {
    x: translatedX,
    y: translatedY,
    width: width * size.width,
    height: height * size.height,
  };
};

async function replaceTextInPdf(pdfBuffer, blocks, translation, toLang = "zh") {
  const fontBytes = fs.readFileSync("./han_sans_cn_light.otf");
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);
  // Get the first page of the document
  const pages = pdfDoc.getPages();
  pages.forEach((page, i) => {
    const size = page.getSize();
    const blocksOnPage = blocks.filter((b) => b.Page === i + 1);
    blocksOnPage.forEach((block) => {
      const box = block.Geometry.BoundingBox;
      const translated = translatePosition(
        size,
        box.Left,
        box.Top,
        box.Width,
        box.Height
      );
      page.drawRectangle({
        x: translated.x,
        y: translated.y,
        width: translated.width,
        height: translated.height,
        color: rgb(1, 1, 1),
      });
      const translatedText = translation[block.Text];
      page.drawText(translatedText, {
        x: translated.x,
        y: translated.y,
        size: 12,
        font: customFont,
      });
    });
  });
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const translatedPdf = await pdfDoc.save();
  fs.writeFileSync("translated_one_pager_summary_zh.pdf", translatedPdf);
}

const pdf = fs.readFileSync("./one_pager_summary.pdf");
// Get text detection blocks from Textract
const blocks = fs.readFileSync("./blocks.txt");
const parsedBlocks = JSON.parse(blocks).filter((b) => b.BlockType === "LINE");
// Translate all the text from above into designated language
const translation = fs.readFileSync("./zipped_translation.txt", "utf-8");
const parsedTranslation = JSON.parse(translation);

// Replace the text in designated language
replaceTextInPdf(pdf, parsedBlocks, parsedTranslation);
