
import React from 'react';
import ClassroomScreen from './pages/ClassroomScreen';
import { ThemeProvider } from './components/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="h-screen w-full overflow-hidden bg-slate-50 transition-colors duration-300">
        <ClassroomScreen />
      </div>
    </ThemeProvider>
  );
};

export default App;
