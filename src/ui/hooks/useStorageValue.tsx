import { useCallback, useEffect, useState } from "react";
import {
  createStorageGetter,
  createStorageSetter,
  StorageKey,
  StorageValueType,
} from "@/app/storage";

export default function useStorageValue<Key extends StorageKey>(
  storageKey: Key,
  initialState?: StorageValueType<Key>,
): [
  value: StorageValueType<Key> | undefined,
  (newValue: StorageValueType<Key>) => void,
] {
  const [value, setValue] = useState<StorageValueType<Key> | undefined>(
    initialState,
  );

  const onStorageChange = useCallback(
    (changes: chrome.storage.StorageChange) => {
      for (const [key, { newValue }] of Object.entries(changes)) {
        if ((key as StorageKey) !== storageKey) {
          continue;
        }
        setValue(newValue as StorageValueType<Key>);
      }
    },
    [storageKey],
  );

  const setStorageValue = useCallback(
    (newValue: StorageValueType<Key>) => {
      const setter = createStorageSetter(storageKey);
      setter(newValue).catch((err) => {
        console.error(
          `[useStorageValue.tsx] Cannot set value to '${storageKey}': ${(err as Error).toString()}`,
        );
      });
    },
    [storageKey],
  );

  useEffect(() => {
    const getter = createStorageGetter(storageKey);
    getter()
      .then((value) => {
        setValue(value);
      })
      .catch((err) => {
        console.error(
          `[useStorageValue.tsx] Unable to get initial value for '${storageKey}': ${(err as Error).toString()}`,
        );
      });
  }, [storageKey]);

  useEffect(() => {
    chrome.storage.onChanged.addListener(onStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(onStorageChange);
    };
  }, [onStorageChange]);

  return [value, setStorageValue];
}
