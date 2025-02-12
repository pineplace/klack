import { config } from "@/app/config";
import { RecordingState, storage } from "@/app/storage";

chrome.runtime.onInstalled.addListener((_details) => {
  console.log("Handle 'chrome.runtime.onInstalled'");
  (async () => {
    await storage.current.tabId.set(0);
    await storage.current.windowId.set(0);
    await storage.devices.mic.enabled.set(true);
    await storage.devices.mic.id.set("");
    await storage.devices.mic.name.set("");
    await storage.devices.mic.volume.set(0);
    await storage.devices.video.enabled.set(true);
    await storage.devices.video.id.set("");
    await storage.devices.video.name.set("");
    await storage.recording.state.set(RecordingState.NotStarted);
    await storage.ui.cameraBubble.enabled.set(false);
    await storage.ui.cameraBubble.position.set({ x: 0, y: 0 });
    await storage.ui.cameraBubble.size.set({ width: 200, height: 200 });
    await storage.ui.cameraBubble.tabId.set(0);

    console.log(`Configuration: ${JSON.stringify(config, undefined, 2)}`);
    console.log(
      `Storage: ${JSON.stringify(await storage.getEntireStorage(), undefined, 2)}`,
    );
  })().catch((err) => {
    console.error(
      `Error in 'chrome.runtime.onInstalled' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `'${key}' '${JSON.stringify(oldValue)}'-->'${JSON.stringify(newValue)}'`,
    );
  }
});
