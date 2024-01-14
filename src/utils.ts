let debounceTimer: number | undefined;

export function debounce(callback: () => void, time: number) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, time) as unknown as number;
}

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
