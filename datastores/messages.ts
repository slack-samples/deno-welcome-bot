import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const DATASTORE_NAME = "messages";

export const MessageSetupDatastore = DefineDatastore({
  name: DATASTORE_NAME,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    message: {
      type: Schema.types.string,
    },
    author: {
      type: Schema.slack.types.user_id,
    },
  },
});
