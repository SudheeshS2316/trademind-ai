// Background Signal Scheduler
// Runs signal generation automatically during market hours using node-cron
import cron from 'node-cron';
import { Server as SocketIOServer } from 'socket.io';
import { generateLiveSignals } from './signalEngine';

let io: SocketIOServer | null = null;

export function initSignalScheduler(socketIO: SocketIOServer) {
  io = socketIO;

  // Run every 15 minutes during market hours (9:15 AM - 3:30 PM IST, Mon-Fri)
  // Cron format: minute hour dayOfMonth month dayOfWeek
  // IST = UTC+5:30, so 9:15 IST = 3:45 UTC, 15:30 IST = 10:00 UTC
  // We run at minutes 0,15,30,45 during hours 3-9 UTC (covers 8:30-15:30 IST roughly)
  cron.schedule('0,15,30,45 3-9 * * 1-5', async () => {
    try {
      const now = new Date();
      const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() + 30 >= 60 ? 1 : 0);
      const istMinute = (now.getUTCMinutes() + 30) % 60;

      // More precise check: only run between 9:15 and 15:30 IST
      const istTime = istHour * 100 + istMinute;
      if (istTime < 915 || istTime > 1530) {
        return;
      }

      console.log(`⏰ [Scheduler] Generating signals at ${now.toISOString()}`);
      const signals = await generateLiveSignals(8);

      if (signals.length > 0 && io) {
        io.to('signals').emit('signal:new', signals);
        console.log(`⏰ [Scheduler] Generated ${signals.length} signals, pushed to WebSocket clients`);
      } else {
        console.log(`⏰ [Scheduler] No strong signals found in this scan`);
      }
    } catch (error) {
      console.error('⏰ [Scheduler] Error generating signals:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Generate opening signals at 9:15 AM IST every weekday
  cron.schedule('15 9 * * 1-5', async () => {
    try {
      console.log(`🔔 [Scheduler] Market open — generating opening signals`);
      const signals = await generateLiveSignals(10);
      if (signals.length > 0 && io) {
        io.to('signals').emit('signal:new', signals);
        console.log(`🔔 [Scheduler] Opening scan: ${signals.length} signals generated`);
      }
    } catch (error) {
      console.error('🔔 [Scheduler] Error generating opening signals:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('⏰ Signal scheduler initialized (market hours: 9:15-15:30 IST, Mon-Fri)');
}
