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

export async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener("error", () => {
      reject(fileReader.error);
    });
    fileReader.addEventListener("loadend", () => {
      const base64 = fileReader.result as string;
      resolve(base64.split(",").at(-1) as string);
    });

    fileReader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string, type: string) {
  const decoded = self.atob(base64);
  const data = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    data[i] = decoded.charCodeAt(i);
  }
  return new Blob([data], {
    type,
  });
}
