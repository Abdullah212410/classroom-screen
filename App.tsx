
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MultiScreenManager from './pages/MultiScreenManager';
import ScreenView from './pages/ScreenView';
import { ThemeProvider } from './components/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Routes>
        {/* Main classroom control interface */}
        <Route path="/" element={
          <div className="h-screen w-full overflow-hidden bg-slate-50 transition-colors duration-300">
            <MultiScreenManager />
          </div>
        } />

        {/* Full-screen display view (for projector/second screen) */}
        <Route path="/screen" element={<ScreenView />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
