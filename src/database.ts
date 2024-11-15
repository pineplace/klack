import Dexie, { EntityTable } from "dexie";

interface Recording {
  uuid: string;
  state: "countdown" | "started" | "paused" | "stopped" | "cancelled";
  chunks: BlobPart[];
  startedAtISO: string;
  stoppedAtISO?: string;
}

const database = new Dexie("klack-database") as Dexie & {
  recordings: EntityTable<Recording, "uuid">;
};

database.version(1).stores({
  recordings: "&uuid, state, chunks, startedAtISO, stoppedAtISO",
});

export { Recording, database };
