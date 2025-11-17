import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import React, { useState, useEffect } from "react"
import { NotificationProvider } from "../contexts/NotificationContext"
import styles from "./components.module.css"

export default function Layout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`flex ${isMobile ? styles.mobileLayout : ''}`} style={{ backgroundColor: 'var(--secondary-50)', minHeight: '100vh' }}>
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'p-0' : 'p-6'}`} style={{ backgroundColor: 'var(--secondary-50)', minHeight: '100vh' }}>
        <NotificationProvider>
          <Outlet />
        </NotificationProvider>
      </main>
    </div>
  )
}
