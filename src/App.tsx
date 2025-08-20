import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Schools from './pages/Schools';
import Sports from './pages/Sports';
import Schedule from './pages/Schedule';
import Articles from './pages/Articles';
import Login from './pages/Login';
import Admin from './pages/Admin';
import SchoolPage from './pages/School';
import Layout from './components/Layout';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/:id" element={<SchoolPage />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </>
  );
}

export default App; 