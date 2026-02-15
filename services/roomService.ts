
import { RoomState, Widget, RoomBackground, SyncMessage } from '../types';

const STORAGE_PREFIX = 'classroom_screen_';
const SYNC_CHANNEL = 'classroom_screen_sync';

class RoomService {
  private channel: BroadcastChannel;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    this.channel = new BroadcastChannel(SYNC_CHANNEL);
    this.channel.onmessage = (event) => {
      this.listeners.forEach((l) => l(event.data));
    };
  }

  getRoomState(roomId: string): RoomState {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${roomId}`);
    if (saved) {
      return JSON.parse(saved);
    }
    const initialState: RoomState = {
      roomId,
      background: { type: 'none', value: '', fit: 'cover' },
      widgets: []
    };
    this.saveRoomState(initialState);
    return initialState;
  }

  saveRoomState(state: RoomState) {
    localStorage.setItem(`${STORAGE_PREFIX}${state.roomId}`, JSON.stringify(state));
  }

  broadcast(msg: SyncMessage) {
    this.channel.postMessage(msg);
  }

  addListener(callback: (msg: SyncMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const roomService = new RoomService();
