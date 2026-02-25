import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar.jsx";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Fixed top navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar — fixed on desktop, slide-in on mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content — pushed right on desktop */}
        <main className="flex-1 min-h-screen lg:ml-64 pt-4 px-4 sm:px-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
export default App;