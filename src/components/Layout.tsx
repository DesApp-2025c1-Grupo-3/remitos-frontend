import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import React from "react"

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 " >
        <Outlet />
      </main>
    </div>
  )
}
