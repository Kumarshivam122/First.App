import { getPendingRecords, markRecordsAsSynced, saveSensorRecordLocal } from './DatabaseService';
import { uploadBatchSensors, fetchNodeMcuData, fetchPendingCommands, sendNodeMcuCommand, ackCommand } from './api';

export const startSyncManager = () => {
  console.log("Sync Manager started (Phase 3 Hardware Integration)");
  
  // High-frequency Local NodeMCU Poll (Every 2 seconds)
  setInterval(async () => {
    try {
      const data = await fetchNodeMcuData();
      if (data && data.container) {
        // We received merged data from NodeMCU, save to local SQLite
        const record = {
          deviceId: 'CONTAINER-001',
          sequence: data.container.sequence,
          temperature: data.container.temperature,
          humidity: data.container.humidity,
          mq6: data.container.mq6,
          battery: data.container.battery,
          solarVoltage: data.container.solar,
          mq3: data.driver.mq3,
          mpu6050: JSON.stringify(data.driver.motion),
          hash: 'SIMULATED_HASH_' + Date.now()
        };
        await saveSensorRecordLocal(record);
      }
    } catch (e) {
      // Ignore: NodeMCU might be out of range or Local Wi-Fi disconnected
    }
  }, 2000);

  // Internet Sync & Command Queue Loop (Every 5 seconds)
  setInterval(async () => {
    try {
      // 1. Sync Data UP to Backend
      const pending = await getPendingRecords();
      if (pending.length > 0) {
        const response = await uploadBatchSensors('CONTAINER-001', pending);
        if (response.success && response.accepted > 0) {
          const syncedSequences = pending
            .filter(r => !response.failedSequences?.includes(r.sequence))
            .map(r => r.sequence);
          await markRecordsAsSynced(syncedSequences);
        }
      }

      // 2. Fetch Commands DOWN from Backend
      const commandRes = await fetchPendingCommands('CONTAINER-001');
      if (commandRes.success && commandRes.data && commandRes.data.length > 0) {
        for (let cmd of commandRes.data) {
          try {
            // Push command to NodeMCU
            const nrfRes = await sendNodeMcuCommand(cmd.command);
            // Report success back to Backend
            await ackCommand(cmd.commandId, nrfRes);
          } catch (e) {
             // Failed to send to NodeMCU, keep it pending in Backend for retry
          }
        }
      }

    } catch (error) {
      // Internet Offline
    }
  }, 5000);
};
