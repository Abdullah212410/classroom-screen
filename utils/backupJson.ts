
import { RoomState } from '../types';

interface BackupData {
  appName: string;
  schemaVersion: number;
  exportedAt: string;
  data: Partial<RoomState>;
}

export const exportStateToJson = (room: RoomState) => {
  try {
    const backup: BackupData = {
      appName: 'Classroom Screen Clone',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: room
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `classroom-screen-backup-${date}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed', error);
    alert('Failed to generate backup file.');
  }
};

export const importStateFromJson = async (file: File): Promise<RoomState | null> => {
  return new Promise((resolve) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('Please select a valid JSON file.');
      resolve(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('File is too large (max 2MB).');
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text) as BackupData;

        // Validation
        if (json.appName !== 'Classroom Screen Clone' || !json.data) {
          alert('Invalid backup file format.');
          resolve(null);
          return;
        }

        // Basic schema check (ensure critical fields exist or allow partial recovery)
        if (!Array.isArray(json.data.widgets) || typeof json.data.background !== 'object') {
             alert('Backup data is missing required fields (widgets or background).');
             resolve(null);
             return;
        }

        resolve(json.data as RoomState);
      } catch (err) {
        alert('Failed to parse JSON file.');
        resolve(null);
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
      resolve(null);
    };
    reader.readAsText(file);
  });
};
