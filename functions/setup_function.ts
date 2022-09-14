import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { DATASTORE_NAME } from "../datastores/welcome_message_db.ts";
import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

//FLOW #1 - WELCOME MESSAGE SETUP

// This custom function definition will take the initial form input and store it into the datastore.
export const WelcomeMessageSetupFunction = DefineFunction({
  callback_id: "welcome_message_setup_function",
  title: "Welcome Message Setup",
  description: "Takes a welcome message and stores it in the datastore",
  source_file: "functions/setup.ts",
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

const setupFunction: SlackFunctionHandler<
  typeof WelcomeMessageSetupFunction.definition
> = async (
  { inputs, token },
) => {
  const client = SlackAPI(token, {});

  const uuid = crypto.randomUUID();

  //Creating a datastore record for the message
  const putResponse = await client.apps.datastore.put({
    datastore: DATASTORE_NAME,
    item: {
      id: uuid,
      channel: inputs.channel,
      message: inputs.welcome_message,
      author: inputs.author,
    },
  });

  //Error handling
  if (!putResponse.ok) {
    return await {
      error: putResponse.error,
      outputs: {},
    };
  } else {
    // FLOW #2
    // Creating event trigger for Workflow #2
    const triggerResponse = await client.workflows.triggers.create({
      type: "event",
      name: "Member joined response",
      description: "Triggers when member joined",
      workflow: "#/workflows/send_welcome_message_workflow",
      event: {
        event_type: "slack#/events/user_joined_channel",
        channel_ids: [inputs.channel],
      },
      inputs: {
        channel: {
          value: "{{data.channel_id}}",
        },
        triggered_user: {
          value: "{{data.user_id}}",
        },
      },
    });

    console.log(triggerResponse);
    return await {
      outputs: {},
    };
  }
};

export default setupFunction;
