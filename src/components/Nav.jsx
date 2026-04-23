import { Link, NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav-brand">
        Trust Onboarding
      </Link>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
      </div>
    </nav>
  );
}
