import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import React from "react"
import { NotificationProvider } from "../contexts/NotificationContext"

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--secondary-50)' }}>
      <Sidebar />
      <main className="flex-1 p-6" style={{ backgroundColor: 'var(--secondary-50)' }}>
        <NotificationProvider>
          <Outlet />
        </NotificationProvider>
      </main>
    </div>
  )
}
