import { Manifest } from "deno-slack-sdk/mod.ts";
import { MessageSetupDatastore } from "./datastores/welcome_message_db.ts";
import { MessageSetupWorkflow } from "./workflows/message_setup_workflow.ts";
import { SendWelcomeMessageWorkflow } from "./workflows/send_welcome_message_workflow.ts";

export default Manifest({
  name: "Welcome Message Bot",
  description:
    "Quick and easy way to setup automated welcome messages for channels in your workspace.",
  icon: "assets/icon.png",
  workflows: [MessageSetupWorkflow, SendWelcomeMessageWorkflow],
  outgoingDomains: [],
  datastores: [MessageSetupDatastore],
  botScopes: [
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:read",
    "triggers:write",
  ],
});
