import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ensurePersistentStorage } from "./persist";
import { db as __backupDb } from "./db";
import { installBackup } from "./backup";


// Request durable storage before mounting so local data survives.
void ensurePersistentStorage();


// Cloud backup + restore-on-empty so a browser wipe can't lose data.
installBackup(__backupDb, { appId: "le-regal", userTables: ["cabinet","seen"] });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
