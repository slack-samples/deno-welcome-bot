import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { DATASTORE_NAME } from "../datastores/messages.ts";
import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

/**
 * This custom function will take the initial form input, store it
 * in the datastore and create an event trigger to listen for
 * user_joined_channel events in the specified channel.
 */
export const WelcomeMessageSetupFunction = DefineFunction({
  callback_id: "welcome_message_setup_function",
  title: "Welcome Message Setup",
  description: "Takes a welcome message and stores it in the datastore",
  source_file: "functions/create_welcome_message.ts",
  input_parameters: {
    properties: {
      welcome_message: {
        type: Schema.types.string,
        description: "The welcome message",
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel to post in",
      },
      author: {
        type: Schema.slack.types.user_id,
        description:
          "The user ID of the person who created the welcome message",
      },
    },
    required: ["welcome_message", "channel"],
  },
});

export default SlackFunction(
  WelcomeMessageSetupFunction,
  async ({ inputs, client }) => {
    const uuid = crypto.randomUUID();

    const putResponse = await client.apps.datastore.put({
      datastore: DATASTORE_NAME,
      item: {
        id: uuid,
        channel: inputs.channel,
        message: inputs.welcome_message,
        author: inputs.author,
      },
    });

    if (!putResponse.ok) {
      return {
        error: putResponse.error,
        outputs: {},
      };
    } else {
      return {
        outputs: {},
      };
    }
  },
);
