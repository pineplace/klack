export enum RecordingState {
  NotStarted = "Not Started",
  Started = "Started",
  Stopped = "Stop",
  Paused = "Pause",
  Canceled = "Canceled",
}

function generateSetGet<ValueType>(valueName: string) {
  return {
    set: (value: ValueType) => {
      console.log(`[database.ts] Set '${valueName}'=${JSON.stringify(value)}`);
      return chrome.storage.local.set({
        [valueName]: value,
      });
    },
    get: async () => {
      const { [valueName]: value } = await chrome.storage.local.get(valueName);
      console.log(`[database.ts] Get '${valueName}'=${JSON.stringify(value)}`);
      return value as ValueType;
    },
  };
}

const recordingsInternalStorage = {
  uuids: generateSetGet<string[] | undefined>("database.recordings.uuid"),
  states: generateSetGet<{ [uuid: string]: RecordingState } | undefined>(
    "database.recordings.states",
  ),
  chunks: generateSetGet<{ [uuid: string]: string[] } | undefined>(
    "database.recordings.chunks",
  ),
};

const databaseRecordings = {
  add: async (uuid: string) => {
    const uuids = (await recordingsInternalStorage.uuids.get()) || [];
    uuids.push(uuid);
    await recordingsInternalStorage.uuids.set(uuids);

    const states = (await recordingsInternalStorage.states.get()) || {};
    states[uuid] = RecordingState.NotStarted;
    await recordingsInternalStorage.states.set(states);

    const chunks = (await recordingsInternalStorage.chunks.get()) || {};
    chunks[uuid] = [];
    await recordingsInternalStorage.chunks.set(chunks);

    console.log(`[database.ts] Recording with uuid='${uuid}' has been added`);
  },
  delete: async (uuid: string) => {
    const uuids = (await recordingsInternalStorage.uuids.get()) || [];
    const uuidIdx = uuids.indexOf(uuid);
    if (uuidIdx === -1) {
      throw new Error(
        `[database.ts] Recording with uuid='${uuid}' wasn't found and can't be deleted`,
      );
    }
    uuid.slice(uuidIdx, 1);
    await recordingsInternalStorage.uuids.set(uuids);

    const states = (await recordingsInternalStorage.states.get()) || {};
    if (!states[uuid]) {
      throw new Error(
        `[database.ts] State with uuid='${uuid}' wasn't found and can't be deleted`,
      );
    }
    delete states[uuid];
    await recordingsInternalStorage.states.set(states);

    const chunks = (await recordingsInternalStorage.chunks.get()) || {};
    if (!chunks[uuid]) {
      throw new Error(
        `[database.ts] Chunk with uuid='${uuid}' wasn't found and can't be deleted`,
      );
    }
    delete chunks[uuid];
    await recordingsInternalStorage.chunks.set(chunks);
    console.log(`[database.ts] Recording with uuid='${uuid}' has been deleted`);
  },
  get: async (uuid: string) => {
    const recordings = await recordingsInternalStorage.uuids.get();
    if (!recordings?.includes(uuid)) {
      throw new Error(`[database.ts] Can't find recording with uuid='${uuid}'`);
    }

    return {
      uuid: uuid,
      state: {
        set: async (state: RecordingState) => {
          const states = (await recordingsInternalStorage.states.get()) || {};
          if (!states[uuid]) {
            throw new Error(
              `[database.ts] Can't find state for recording with uuid='${uuid}'`,
            );
          }
          states[uuid] = state;
          await recordingsInternalStorage.states.set(states);
        },
        get: async () => {
          const states = (await recordingsInternalStorage.states.get()) || {};
          if (!states[uuid]) {
            throw new Error(
              `[database.ts] Can't find state for recording with uuid='${uuid}'`,
            );
          }
          return states[uuid];
        },
      },
      chunks: {
        add: async (chunk: string) => {
          const chunks = (await recordingsInternalStorage.chunks.get()) || {};
          if (!chunks[uuid]) {
            throw new Error(
              `[database.ts] Can't find chunks for recording with uuid='${uuid}'`,
            );
          }
          chunks[uuid].push(chunk);
          await recordingsInternalStorage.chunks.set(chunks);
        },
        get: async () => {
          const chunks = (await recordingsInternalStorage.chunks.get()) || {};
          if (!chunks[uuid]) {
            throw new Error(
              `[database.ts] Can't find chunks for recording with uuid='${uuid}'`,
            );
          }
          return chunks[uuid];
        },
      },
    };
  },
};

export const database = {
  recordings: databaseRecordings,
};

export type Database = typeof database;
