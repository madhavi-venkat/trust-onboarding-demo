import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import ApplicationDetail from './pages/ApplicationDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
