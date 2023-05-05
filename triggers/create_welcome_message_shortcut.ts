import { Trigger } from "deno-slack-api/types.ts";
import MessageSetupWorkflow from "../workflows/create_welcome_message.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This link trigger prompts the MessageSetupWorkflow workflow.
 */
const welcomeMessageTrigger: Trigger<typeof MessageSetupWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup a Welcome Message",
  description: "Creates an automated welcome message for a given channel.",
  workflow: `#/workflows/${MessageSetupWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default welcomeMessageTrigger;
