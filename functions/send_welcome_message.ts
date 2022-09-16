import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { DATASTORE_NAME } from "../datastores/messages.ts";
import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

/**
 * This custom function will pull the stored message from the datastore
 * and send it to the joining user as an ephemeral message in the
 * specified channel.
 */
export const SendWelcomeMessageFunction = DefineFunction({
  callback_id: "send_welcome_message_function",
  title: "Sending the Welcome Message",
  description: "Pull the welcome messages and sends it to the new user",
  source_file: "functions/send_welcome_message.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel where the event was triggered",
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
        description: "User that triggered the event",
      },
    },
    required: ["channel", "triggered_user"],
  },
});

const setupFunction: SlackFunctionHandler<
  typeof SendWelcomeMessageFunction.definition
> = async (
  { inputs, token },
) => {
  const client = SlackAPI(token, {});
  // Querying datastore for stored messages
  const result = await client.apps.datastore.query({
    datastore: DATASTORE_NAME,
    expression: "#channel = :mychannel",
    expression_attributes: { "#channel": "channel" },
    expression_values: { ":mychannel": inputs.channel },
  });

  for (const item of result["items"]) {
    await client.chat.postEphemeral({
      channel: item["channel"],
      text: item["message"],
      user: inputs.triggered_user,
    });
  }

  return await {
    outputs: {},
  };
};

export default setupFunction;
