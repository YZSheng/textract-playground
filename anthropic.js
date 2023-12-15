import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { fromIni } from "@aws-sdk/credential-providers";

// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
const profileName = "default";

const bedrockClient = new BedrockRuntimeClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});

const decoder = new TextDecoder();

const response = await bedrockClient.send(
  new InvokeModelCommand({
    body: JSON.stringify({
      prompt: "\n\nHuman: explain black holes to 8th graders\n\nAssistant:",
      max_tokens_to_sample: 300,
      temperature: 0.1,
      top_p: 0.9,
    }),
    contentType: "application/json",
    accept: "application/json",
    modelId: "anthropic.claude-v2",
  })
);

console.log(decoder.decode(response.body));
