import { Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Studio from './pages/Studio/Studio';
import.meta.env.MODE

function App() {
  console.log("current mode:", import.meta.env.MODE);
  // Disable console logs in production mode
  if (import.meta.env.MODE === 'production') {
    console.log = () => { };
    console.warn = () => { };
    console.debug = () => { };
  }


  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Studio />} />
      </Routes>
    </AppProvider>
  );
}

export default App;