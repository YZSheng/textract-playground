// Import required AWS SDK clients and commands for Node.js
import {
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import { TextractClient } from "@aws-sdk/client-textract";
import { fromIni } from "@aws-sdk/credential-providers";
import fs from "fs";

function encodePdfToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "base64" }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Set the AWS Region.
const REGION = "ap-southeast-1"; //e.g. "us-east-1"
const profileName = "default";

// Create SNS service object.
const textractClient = new TextractClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});

const bucket = "apollo-textract-spike";
const photo = "input/executive_summary.png";

// Set params
const params = {
  Document: {
    S3Object: {
      Bucket: bucket,
      Name: photo,
    },
  },
  FeatureTypes: ["TABLES", "FORMS", "SIGNATURES"],
};

const displayBlockInfo = async (response) => {
  try {
    response.Blocks.forEach((block) => {
      console.log(`ID: ${block.Id}`);
      console.log(`Block Type: ${block.BlockType}`);
      if ("Text" in block && block.Text !== undefined) {
        console.log(`Text: ${block.Text}`);
      } else {
      }
      if ("Confidence" in block && block.Confidence !== undefined) {
        console.log(`Confidence: ${block.Confidence}`);
      } else {
      }
      if (block.BlockType == "CELL") {
        console.log("Cell info:");
        console.log(`   Column Index - ${block.ColumnIndex}`);
        console.log(`   Row - ${block.RowIndex}`);
        console.log(`   Column Span - ${block.ColumnSpan}`);
        console.log(`   Row Span - ${block.RowSpan}`);
      }
      if ("Relationships" in block && block.Relationships !== undefined) {
        console.log(block.Relationships);
        console.log("Geometry:");
        console.log(
          `   Bounding Box - ${JSON.stringify(block.Geometry.BoundingBox)}`
        );
        console.log(`   Polygon - ${JSON.stringify(block.Geometry.Polygon)}`);
      }
      console.log("-----");
    });
  } catch (err) {
    console.log("Error", err);
  }
};

const analyze_document_text = async () => {
  try {
    const filePath = "executive_summary.png";
    const fileData = fs.readFileSync(filePath);
    const uint8ArrayData = new Uint8Array(fileData);
    const analyzeDoc = new AnalyzeDocumentCommand({
      Document: {
        Bytes: uint8ArrayData,
      },
    });
    const response = await textractClient.send(analyzeDoc);
    return response;
  } catch (err) {
    console.log("Error", err);
  }
};

const detectText = async () => {
  const filePath = "executive_summary.png";
  const fileData = fs.readFileSync(filePath);
  const uint8ArrayData = new Uint8Array(fileData);

  const detectText = new DetectDocumentTextCommand({
    Document: {
      Bytes: uint8ArrayData,
    },
  });
  const detectResponse = await textractClient.send(detectText);
  console.log(detectResponse);
};

detectText();
// analyze_document_text();
