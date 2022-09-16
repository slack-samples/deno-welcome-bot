import { Trigger } from "deno-slack-api/types.ts";

/**
 * This link trigger prompts the MessageSetupWorkflow workflow.
 */
const welcomeMessageTrigger: Trigger = {
  type: "shortcut",
  name: "Setup a Welcome Message",
  description: "Creates an automated welcome message for a given channel.",
  workflow: "#/workflows/message_setup_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default welcomeMessageTrigger;
