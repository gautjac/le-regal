// Cloud backup for the app's local Dexie data, so a browser eviction / clear
// can never mean permanent loss. Mirrors every table to Firestore
// (project charlotte-dashboard, collection `app_backups/{appId}`) as a JSON
// string, debounced on change and on tab-hide. On load, if the app's user
// tables are empty but a cloud backup exists, it restores them.
//
// Posture matches the rest of Jac's stack: the Firebase web config is public by
// design; access is gated by Firestore rules + the undisclosed site URL, not by
// secrecy. Best-effort throughout — it never throws and never blocks the app.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import type Dexie from "dexie";

const config = {
  apiKey: "AIzaSyC2xUjWzIU35j_frmg6yI-JigW8ehKZVKQ",
  authDomain: "charlotte-dashboard.firebaseapp.com",
  projectId: "charlotte-dashboard",
  storageBucket: "charlotte-dashboard.firebasestorage.app",
  messagingSenderId: "337505774756",
  appId: "337505774756:web:2ba56951181f406890ca31",
};

let fs: Firestore | undefined;
function getFs(): Firestore | undefined {
  try {
    if (!config.apiKey) return undefined;
    if (!fs) {
      const app: FirebaseApp = getApps().length ? getApp() : initializeApp(config);
      fs = getFirestore(app);
    }
    return fs;
  } catch {
    return undefined;
  }
}

// Drop Blob/File/ArrayBuffer values (e.g. cached backdrop images) so backups
// stay small and JSON-serializable; the invested *content* is what matters.
function stripBinary(value: unknown): unknown {
  if (value == null) return value;
  if (value instanceof Blob || value instanceof ArrayBuffer) return undefined;
  if (Array.isArray(value)) return value.map(stripBinary);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const s = stripBinary(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return value;
}

async function exportAll(db: Dexie): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  await db.transaction("r", db.tables, async () => {
    for (const t of db.tables) {
      out[t.name] = (await t.toArray()).map((r) => stripBinary(r) as unknown);
    }
  });
  return out;
}

const DEBOUNCE_MS = 1500;
const MAX_JSON = 950_000; // stay under Firestore's 1 MiB doc limit

async function doBackup(db: Dexie, appId: string): Promise<void> {
  const store = getFs();
  if (!store) return;
  try {
    const data = await exportAll(db);
    const dataJson = JSON.stringify(data);
    if (dataJson.length > MAX_JSON) {
      console.warn(`[backup] ${appId}: data exceeds ${MAX_JSON} bytes — skipping this backup`);
      return;
    }
    await setDoc(doc(store, "app_backups", appId), {
      dataJson,
      updatedAt: Date.now(),
      v: 1,
    });
  } catch (e) {
    console.warn(`[backup] ${appId}: backup failed —`, (e as Error).message);
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
function schedule(db: Dexie, appId: string): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void doBackup(db, appId), DEBOUNCE_MS);
}

async function maybeRestore(db: Dexie, appId: string, userTables: string[]): Promise<void> {
  const store = getFs();
  if (!store) return;
  try {
    // Only restore into an empty app — never clobber existing local data.
    const counts = await Promise.all(
      userTables.filter((t) => db.tables.some((x) => x.name === t)).map((t) => db.table(t).count()),
    );
    if (counts.some((c) => c > 0)) return;

    const snap = await getDoc(doc(store, "app_backups", appId));
    if (!snap.exists()) return;
    const raw = snap.data() as { dataJson?: string };
    const data = JSON.parse(raw.dataJson || "{}") as Record<string, unknown[]>;

    let restored = 0;
    await db.transaction("rw", db.tables, async () => {
      for (const [name, rows] of Object.entries(data)) {
        if (!db.tables.some((t) => t.name === name)) continue;
        if (Array.isArray(rows) && rows.length) {
          await db.table(name).bulkPut(rows);
          restored += rows.length;
        }
      }
    });

    if (restored > 0 && !sessionStorage.getItem("backup-restored")) {
      // Reload once so the already-mounted UI reflects the restored data.
      sessionStorage.setItem("backup-restored", "1");
      console.info(`[backup] ${appId}: restored ${restored} rows from cloud — reloading`);
      location.reload();
    }
  } catch (e) {
    console.warn(`[backup] ${appId}: restore failed —`, (e as Error).message);
  }
}

/**
 * Wire cloud backup + restore-on-empty for a Dexie database.
 * @param db         the app's Dexie instance
 * @param appId      Firestore doc id under `app_backups` (use the DB name)
 * @param userTables tables whose emptiness means "restore from cloud if a backup exists"
 */
export function installBackup(
  db: Dexie,
  { appId, userTables }: { appId: string; userTables: string[] },
): void {
  void maybeRestore(db, appId, userTables).finally(() => {
    for (const t of db.tables) {
      t.hook("creating", () => schedule(db, appId));
      t.hook("updating", () => schedule(db, appId));
      t.hook("deleting", () => schedule(db, appId));
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") void doBackup(db, appId);
      });
      window.addEventListener("pagehide", () => void doBackup(db, appId));
    }
  });
}
