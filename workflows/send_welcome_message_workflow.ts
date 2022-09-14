import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendWelcomeMessageFunction } from "../functions/send.ts";

//Workflow #2: Define the Send Welcome Message WorkFlow, which will retrive the welcome message from the datastore and send it to channel, when a new user joins the channel.

export const SendWelcomeMessageWorkflow = DefineWorkflow({
  callback_id: "send_welcome_message_workflow",
  title: "Send Welcome Message",
  description:
    "Posts an ephemeral welcome message when a new user joins a channel.",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel", "triggered_user"],
  },
});

// Step #1: Adding the custom function above as a step to Workflow #2.
SendWelcomeMessageWorkflow.addStep(SendWelcomeMessageFunction, {
  channel: SendWelcomeMessageWorkflow.inputs.channel,
  triggered_user: SendWelcomeMessageWorkflow.inputs.triggered_user,
});
