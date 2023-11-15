import { Trigger } from "deno-slack-api/types.ts";
import { SendWelcomeMessageWorkflow } from "../workflows/send_welcome_message.ts";

/**
 * newSendWelcomeMessageTrigger constructs a new user_joined_channel trigger
 * for the "Send Welcome Message" workflow in a specified channel.
 */
export function newSendWelcomeMessageTrigger(
  channel: string,
): Trigger<typeof SendWelcomeMessageWorkflow.definition> {
  return {
    type: "event",
    name: "User joined channel",
    description: "Send a message when a user joins the channel",
    workflow:
      `#/workflows/${SendWelcomeMessageWorkflow.definition.callback_id}`,
    event: {
      event_type: "slack#/events/user_joined_channel",
      channel_ids: [channel],
    },
    inputs: {
      channel: { value: channel },
      triggered_user: { value: "{{data.user_id}}" },
    },
  };
}
