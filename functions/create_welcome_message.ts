import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";

import { SendWelcomeMessageWorkflow } from "../workflows/send_welcome_message.ts";
import { WelcomeMessageDatastore } from "../datastores/messages.ts";

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
      message: {
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
    required: ["message", "channel"],
  },
});

export default SlackFunction(
  WelcomeMessageSetupFunction,
  async ({ inputs, client }) => {
    const { channel, message, author } = inputs;
    const uuid = crypto.randomUUID();

    // Save information about the welcome message to the datastore
    const putResponse = await client.apps.datastore.put<
      typeof WelcomeMessageDatastore.definition
    >({
      datastore: WelcomeMessageDatastore.name,
      item: { id: uuid, channel, message, author },
    });

    if (!putResponse.ok) {
      return { error: `Failed to save welcome message: ${putResponse.error}` };
    }

    // Search for any existing triggers for the welcome workflow
    const triggers = await findUserJoinedChannelTrigger(client, channel);
    if (triggers.error) {
      return { error: `Failed to lookup existing triggers: ${triggers.error}` };
    }

    // Create a new user_joined_channel trigger if none exist
    if (!triggers.exists) {
      const newTrigger = await saveUserJoinedChannelTrigger(client, channel);
      if (!newTrigger.ok) {
        return {
          error: `Failed to create welcome trigger: ${newTrigger.error}`,
        };
      }
    }

    return { outputs: {} };
  },
);

/**
 * findUserJoinedChannelTrigger returns if the user_joined_channel trigger
 * exists for the "Send Welcome Message" workflow in a channel.
 */
export async function findUserJoinedChannelTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ error?: string; exists?: boolean }> {
  // Collect all existing triggers created by the app
  const allTriggers = await client.workflows.triggers.list({ is_owner: true });
  if (!allTriggers.ok) {
    return { error: allTriggers.error };
  }

  // Find user_joined_channel triggers for the "Send Welcome Message"
  // workflow in the specified channel
  const joinedTriggers = allTriggers.triggers.filter((trigger) => (
    trigger.workflow.callback_id ===
      SendWelcomeMessageWorkflow.definition.callback_id &&
    trigger.event_type === "slack#/events/user_joined_channel" &&
    trigger.channel_ids.includes(channel)
  ));

  // Return if any matching triggers were found
  const exists = joinedTriggers.length > 0;
  return { exists };
}

/**
 * saveUserJoinedChannelTrigger creates a new user_joined_channel trigger
 * for the "Send Welcome Message" workflow in a channel.
 */
export async function saveUserJoinedChannelTrigger(
  client: SlackAPIClient,
  channel: string,
): Promise<{ ok: boolean; error?: string }> {
  const triggerResponse = await client.workflows.triggers.create<
    typeof SendWelcomeMessageWorkflow.definition
  >({
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
  });

  if (!triggerResponse.ok) {
    return { ok: false, error: triggerResponse.error };
  }
  return { ok: true };
}
