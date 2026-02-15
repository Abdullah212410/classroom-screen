
import React, { useState, useCallback } from 'react';
import ClassroomScreen from './ClassroomScreen';
import { ScreenSwitcher, Screen } from '../components/ScreenSwitcher';

const MultiScreenManager: React.FC = () => {
  const [screens, setScreens] = useState<Screen[]>([
    { id: 'screen-1', name: 'Screen 1', createdAt: Date.now() }
  ]);
  const [activeScreenId, setActiveScreenId] = useState('screen-1');

  const handleCreateScreen = useCallback(() => {
    const newScreenNumber = screens.length + 1;
    const newScreen: Screen = {
      id: `screen-${Date.now()}`,
      name: `Screen ${newScreenNumber}`,
      createdAt: Date.now()
    };

    setScreens(prev => [...prev, newScreen]);
    setActiveScreenId(newScreen.id);
  }, [screens.length]);

  const handleSwitchScreen = useCallback((screenId: string) => {
    setActiveScreenId(screenId);
  }, []);

  const handlePreviousScreen = useCallback(() => {
    const currentIndex = screens.findIndex(s => s.id === activeScreenId);
    if (currentIndex > 0) {
      setActiveScreenId(screens[currentIndex - 1].id);
    }
  }, [screens, activeScreenId]);

  const handleDeleteScreen = useCallback((screenId?: string) => {
    // Prevent deleting the last screen
    if (screens.length <= 1) {
      return;
    }

    const idToDelete = screenId || activeScreenId;
    const indexToDelete = screens.findIndex(s => s.id === idToDelete);

    if (indexToDelete === -1) {
      return;
    }

    // Determine which screen to switch to after deletion
    let newActiveId: string;
    if (idToDelete === activeScreenId) {
      // If deleting current screen, switch to previous or next
      if (indexToDelete > 0) {
        newActiveId = screens[indexToDelete - 1].id;
      } else {
        newActiveId = screens[indexToDelete + 1].id;
      }
    } else {
      // Keep current screen active
      newActiveId = activeScreenId;
    }

    // Remove the screen and update active
    setScreens(prev => prev.filter(s => s.id !== idToDelete));
    setActiveScreenId(newActiveId);

    // Clean up localStorage for deleted screen
    try {
      localStorage.removeItem(`room_${idToDelete}`);
      localStorage.removeItem(`brush_settings_${idToDelete}`);
    } catch (e) {
      console.error('Failed to clean up localStorage:', e);
    }
  }, [screens, activeScreenId]);

  return (
    <>
      <ScreenSwitcher
        screens={screens}
        activeScreenId={activeScreenId}
        onSwitchScreen={handleSwitchScreen}
        onCreateScreen={handleCreateScreen}
      />

      {screens.map((screen, index) => (
        <div
          key={screen.id}
          style={{ display: activeScreenId === screen.id ? 'block' : 'none' }}
        >
          <ClassroomScreen
            roomId={screen.id}
            onCreateNewScreen={handleCreateScreen}
            onPreviousScreen={handlePreviousScreen}
            onDeleteScreen={handleDeleteScreen}
            currentScreenIndex={index + 1}
            totalScreens={screens.length}
            canGoBack={index > 0}
            screensList={screens}
          />
        </div>
      ))}
    </>
  );
};

export default MultiScreenManager;
