let debounceTimer: number | undefined;

export function debounce(callback: () => void, time: number) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, time) as unknown as number;
}
