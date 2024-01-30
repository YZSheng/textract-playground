import fs from "fs";

import {
  TranslateClient,
  TranslateDocumentCommand,
} from "@aws-sdk/client-translate";
import { fromIni } from "@aws-sdk/credential-providers";

const REGION = "us-east-1"; //e.g. "us-east-1"
const profileName = "default";
const translateTxt = async () => {
  const translateClient = new TranslateClient({
    region: REGION,
    credentials: fromIni({ profile: profileName }),
  });
  const result = await translateClient.send(
    new TranslateDocumentCommand({
      Document: {
        Content: fs.readFileSync("./phrases.txt"),
        ContentType: "text/plain",
      },
      SourceLanguageCode: "en", // required
      TargetLanguageCode: "zh", // required
      Settings: {
        // TranslationSettings
        Formality: "FORMAL",
        Profanity: "MASK",
        Brevity: "ON",
      },
    })
  );
  const buffer = result.TranslatedDocument.Content;
  const translated = Buffer.from(buffer).toString("utf-8");
  fs.writeFileSync('./translated_phrases.txt', translated);
};

translateTxt();
