import { config } from "../../config";
import { RecordingState, storage } from "../../storage";

chrome.runtime.onInstalled.addListener((_details) => {
  console.log("[storage_controller.ts] Handle 'chrome.runtime.onInstalled'");
  (async () => {
    await storage.current.windowId.set(0);
    await storage.current.tabId.set(0);

    await storage.devices.video.enabled.set(true);
    await storage.devices.video.id.set("");
    await storage.devices.video.name.set("");

    await storage.devices.mic.enabled.set(true);
    await storage.devices.mic.id.set("");
    await storage.devices.mic.name.set("");
    await storage.devices.mic.volume.set(0);

    await storage.ui.cameraBubble.enabled.set(false);
    await storage.ui.cameraBubble.windowId.set(0);
    await storage.ui.cameraBubble.tabId.set(0);
    await storage.ui.cameraBubble.position.set({ x: 0, y: 0 });
    await storage.ui.cameraBubble.size.set({ width: 200, height: 200 });

    await storage.recording.windowId.set(0);
    await storage.recording.tabId.set(0);
    await storage.recording.state.set(RecordingState.NotStarted);
    await storage.recording.uuid.set("");
    await storage.recording.duration.set(0);

    console.log(
      `[storage_controller.ts] Configuration: ${JSON.stringify(config, undefined, 2)}`,
    );
    console.log(
      `[storage_controller.ts] Storage: ${JSON.stringify(await storage.getEntireStorage(), undefined, 2)}`,
    );
  })().catch((err) => {
    console.error(
      `[storage_controller.ts] Error in 'chrome.runtime.onInstalled' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `[storage_controller.ts] '${key}' '${JSON.stringify(oldValue)}'-->'${JSON.stringify(newValue)}'`,
    );
  }
});
