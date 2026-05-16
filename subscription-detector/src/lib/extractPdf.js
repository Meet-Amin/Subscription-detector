import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

async function extractTextFromPdf(file) {
  if (!(file instanceof File)) {
    throw new Error("extractTextFromPdf: argument must be a File object");
  }

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    throw new Error(`extractTextFromPdf: failed to read file — ${err.message}`);
  }

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    throw new Error(`extractTextFromPdf: failed to parse PDF — ${err.message}`);
  }

  const pageTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      pageTexts.push(pageText);
    } catch (err) {
      throw new Error(`extractTextFromPdf: failed to extract text from page ${i} — ${err.message}`);
    }
  }

  return pageTexts.join("\n");
}

export default extractTextFromPdf;
