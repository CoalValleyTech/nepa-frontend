import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schools from './pages/Schools';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schools" element={<Schools />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App; 