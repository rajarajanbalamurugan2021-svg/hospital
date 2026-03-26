import { AppState } from "../types";
import { INITIAL_STATE } from "../constants";

const DB_KEY = "gsr_hospital_db_v1";
const FB_PATH = "gsr_hospital_state";

// BroadCast Channel for same-browser tab sync
let syncChannel: BroadcastChannel | null = null;
try {
  syncChannel = new BroadcastChannel("gsr_hospital_sync");
} catch (e) {
  console.warn("BroadcastChannel not supported", e);
}

export function saveLocal(state: AppState) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
}

export function loadLocal(): AppState | null {
  try {
    const r = localStorage.getItem(DB_KEY);
    return r ? JSON.parse(r) : null;
  } catch (e) {
    console.error("Failed to load from local storage", e);
    return null;
  }
}

export function broadcastLocal(state: AppState) {
  try {
    syncChannel?.postMessage({ type: "STATE_SYNC", state });
  } catch (e) {
    console.error("Failed to broadcast state", e);
  }
}

export function subscribeToLocalSync(callback: (state: AppState) => void) {
  if (!syncChannel) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "STATE_SYNC") callback(e.data.state);
  };
  syncChannel.addEventListener("message", handler);
  return () => syncChannel.removeEventListener("message", handler);
}

// Firebase Logic (Placeholder for now, can be expanded if set_up_firebase is used)
export async function pushToFirebase(state: AppState) {
  // Implementation depends on actual firebase setup
  console.log("Pushing to firebase...", state);
}
