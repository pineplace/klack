(async () => {
  await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
})().catch((err) => console.error((err as Error).toString()));
