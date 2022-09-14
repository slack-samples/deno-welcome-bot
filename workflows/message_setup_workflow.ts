import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { WelcomeMessageSetupFunction } from "../functions/setup.ts";

// Workflow #1: Defining the setup Workflow that opens a form where the user creates a welcome message. Use the callback id of this workflow in the link trigger definition.

export const MessageSetupWorkflow = DefineWorkflow({
  callback_id: "message_setup_workflow",
  title: "Create Welcome Message",
  description: " Creates a message to welcome new users into the channel.",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

// Step #1: Adding the OpenForm built-in function as a step to the setup Workflow #1. This form takes in a message input and a channel id input.
export const SetupWorkflowForm = MessageSetupWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Welcome Message Form",
    submit_label: "Submit",
    description: ":wave: Create a welcome message for a channel!",
    interactivity: MessageSetupWorkflow.inputs.interactivity,
    fields: {
      required: ["channel", "messageInput"],
      elements: [
        {
          name: "messageInput",
          title: "Your welcome message",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "channel",
          title: "Select a channel to post this message in",
          type: Schema.slack.types.channel_id,
          default: MessageSetupWorkflow.inputs.channel,
        },
      ],
    },
  },
);

// Step #2: Adding the SendEphemeralMessage built-in function as a step to Workflow #1. Message will send after the end user submits their form.
MessageSetupWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: MessageSetupWorkflow.inputs.interactivity.interactor.id,
  message:
    `Your welcome message for this channel was successfully created! :white_check_mark:`,
});

// Step #3: Adding the custom function as a step to Workflow #1. This will take the form output and send it to the custom function
MessageSetupWorkflow.addStep(WelcomeMessageSetupFunction, {
  welcome_message: SetupWorkflowForm.outputs.fields.messageInput,
  channel: SetupWorkflowForm.outputs.fields.channel,
  author: MessageSetupWorkflow.inputs.interactivity.interactor.id,
});

export default MessageSetupWorkflow;
