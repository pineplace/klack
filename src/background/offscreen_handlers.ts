export async function onMessageRecorderStart() {
  console.log("onMessageRecorderStart");
  await new Promise<void>((resolve) => resolve());
}

export async function onMessageRecorderStop() {
  console.log("onMessageRecorderStop");
  await new Promise<void>((resolve) => resolve());
}

export async function onMessageRecorderPause() {
  console.log("onMessageRecorderPause");
  await new Promise<void>((resolve) => resolve());
}

export async function onMessageRecorderResume() {
  console.log("onMessageRecorderResume");
  await new Promise<void>((resolve) => resolve());
}

export async function onMessageRecorderCancel() {
  console.log("onMessageRecorderCancel");
  await new Promise<void>((resolve) => resolve());
}
