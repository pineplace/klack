let throttlePause = false;

export function throttle(callback: () => void, time: number) {
  if (throttlePause) {
    return;
  }

  throttlePause = true;

  setTimeout(() => {
    callback();
    throttlePause = false;
  }, time);
}
