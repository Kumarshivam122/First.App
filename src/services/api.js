const API_BASE = 'http://10.0.2.2:5000/api'; // Backend
const LOCAL_WIFI_BASE = 'http://192.168.4.1/api'; // NodeMCU AP

export const uploadBatchSensors = async (deviceId, records) => {
  try {
    const res = await fetch(`${API_BASE}/sensors/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, records })
    });
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- Backend Commands ---
export const fetchPendingCommands = async (deviceId) => {
  try {
    const res = await fetch(`${API_BASE}/commands/pending/${deviceId}`);
    return await res.json();
  } catch (error) { return { success: false }; }
};

export const ackCommand = async (commandId, response) => {
  try {
    const res = await fetch(`${API_BASE}/commands/${commandId}/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, status: 'acknowledged' })
    });
    return await res.json();
  } catch (error) { return { success: false }; }
};

// --- NodeMCU Local Wi-Fi ---
export const fetchNodeMcuData = async () => {
  // Timeout added so we don't hang if not connected to Local Wi-Fi
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${LOCAL_WIFI_BASE}/data`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const sendNodeMcuCommand = async (command) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${LOCAL_WIFI_BASE}/command`, {
      method: 'POST',
      body: command,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
