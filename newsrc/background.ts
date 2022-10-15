/**
 * Low level Chrome extension callbacks
 * https://developer.chrome.com/docs/extensions/reference/
 */
import {
  ActiveTabInfo,
  onMessage,
  onTabChange,
  onTabClosing,
  RemoveInfo,
  ResponseCallback,
  Sender,
} from "./rapidrec/callbacks";
import { Message } from "./rapidrec/communication";

/*
 * chrome.runtime.*
 * https://developer.chrome.com/docs/extensions/reference/runtime/
 */
chrome.runtime.onMessage.addListener(
  (message: Message, sender: Sender, sendResponse: ResponseCallback) => {
    // https://developer.chrome.com/docs/extensions/mv3/messaging/
    console.log(
      `chrome.runtime.onMessage(message: ${JSON.stringify(
        message
      )}, sender:${JSON.stringify(sender)})`
    );
    onMessage(message, sender, sendResponse)
      .then(() => console.log("Message processed successfully"))
      .catch((_err) => console.error("Message processed with error"));
  }
);

/*
 * chrome.tabs.*
 * https://developer.chrome.com/docs/extensions/reference/tabs/
 */
chrome.tabs.onActivated.addListener((activeTabInfo: ActiveTabInfo) => {
  // https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
  console.log(
    `chrome.tabs.onActivated(activeTabInfo: ${JSON.stringify(activeTabInfo)}`
  );
  onTabChange(activeTabInfo)
    .then(() => console.log("Tab changing processed successfully"))
    .catch((_err) => console.error("Tab changing processed with error"));
});

chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: RemoveInfo) => {
  // https://developer.chrome.com/docs/extensions/reference/tabs/#event-onRemoved
  console.log(
    `chrome.tabs.onRemoved(tabId: ${tabId}, removeInfo: ${JSON.stringify(
      removeInfo
    )})`
  );
  onTabClosing(tabId, removeInfo)
    .then(() => console.log("Tab closing processed successfully"))
    .catch((_err) => console.error("Tab closing processed with error"));
});
