import { Manifest } from "deno-slack-sdk/mod.ts";
import { WelcomeMessageDatastore } from "./datastores/messages.ts";
import { MessageSetupWorkflow } from "./workflows/create_welcome_message.ts";
import { SendWelcomeMessageWorkflow } from "./workflows/send_welcome_message.ts";

export default Manifest({
  name: "Welcome Message Bot",
  description:
    "Quick and easy way to setup automated welcome messages for channels in your workspace.",
  icon: "assets/default_new_app_icon.png",
  workflows: [MessageSetupWorkflow, SendWelcomeMessageWorkflow],
  outgoingDomains: [],
  datastores: [WelcomeMessageDatastore],
  botScopes: [
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:read",
    "triggers:write",
    "triggers:read",
  ],
});
