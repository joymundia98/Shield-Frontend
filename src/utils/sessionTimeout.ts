// sessionTimeout.ts
import { getTokenExpiry } from "./token";

let sessionTimer: ReturnType<typeof setTimeout> | null = null;
let sessionInterval: ReturnType<typeof setInterval> | null = null;

export const startSessionTimer = (
  setExpired: (value: boolean) => void
) => {
  // Clear any existing timers
  if (sessionTimer) clearTimeout(sessionTimer);
  if (sessionInterval) clearInterval(sessionInterval);

  const token = localStorage.getItem("token");
  if (!token) return;

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const timeout = expiry - Date.now();

  if (timeout <= 0) {
    // Token already expired
    setExpired(true);
    clearSessionTimer();
    return;
  }

  // Set exact timeout for token expiry
  sessionTimer = setTimeout(() => {
    localStorage.removeItem("token");
    setExpired(true);
    clearSessionTimer();
  }, timeout);

  // Safety interval to catch token removal or unexpected expiry
  sessionInterval = setInterval(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken || getTokenExpiry(currentToken)! <= Date.now()) {
      setExpired(true);
      clearSessionTimer();
    }
  }, 1000); // check every 1 second
};

export const clearSessionTimer = () => {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
  if (sessionInterval) {
    clearInterval(sessionInterval);
    sessionInterval = null;
  }
};