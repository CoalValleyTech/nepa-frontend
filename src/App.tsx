import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schools from './pages/Schools';
import Sports from './pages/Sports';
import Schedule from './pages/Schedule';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schools" element={<Schools />} />
      <Route path="/sports" element={<Sports />} />
      <Route path="/schedule" element={<Schedule />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App; 