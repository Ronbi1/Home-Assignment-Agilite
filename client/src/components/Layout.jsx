import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="min-h-full bg-gradient-to-b from-background to-background/80">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
