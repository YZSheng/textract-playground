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

// const nonStreamingResponse = await bedrockClient.send(
//   new InvokeModelCommand({
//     body: JSON.stringify({
//       prompt: "\n\nHuman: explain black holes to 8th graders\n\nAssistant:",
//       max_tokens_to_sample: 300,
//       temperature: 0.1,
//       top_p: 0.9,
//     }),
//     contentType: "application/json",
//     accept: "application/json",
//     modelId: "anthropic.claude-v2:1",
//   })
// );

// console.log("Non-streaming response:");
// console.log(decoder.decode(nonStreamingResponse.body));
// console.log("\n");

const streamingResponse = await bedrockClient.send(
  new InvokeModelWithResponseStreamCommand({
    body: JSON.stringify({
      prompt:
        "\n\nHuman: What is the definition of Clean Code in software engineering?\n\nAssistant:",
      max_tokens_to_sample: 1000,
      temperature: 0.1,
      top_p: 0.9,
    }),
    contentType: "application/json",
    accept: "application/json",
    modelId: "anthropic.claude-v2",
  })
);

async function printStreams(streams) {
  for await (const stream of streams) {
    const chunk = JSON.parse(decoder.decode(stream.chunk.bytes));
    console.log(chunk.completion);
  }
}

console.log("Streaming response:");
await printStreams(streamingResponse.body);
