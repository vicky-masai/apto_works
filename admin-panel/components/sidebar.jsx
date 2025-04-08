"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Users, DollarSign, Settings, ChevronDown } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const [isMoneyManagementOpen, setIsMoneyManagementOpen] = useState(false)

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Super Admin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          <li>
            <Link
              href="/"
              className={`flex items-center p-2 rounded-lg ${
                isActive("/")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/tasks"
              className={`flex items-center p-2 rounded-lg ${
                isActive("/tasks")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <CheckSquare className="w-5 h-5 mr-3" />
              <span>Tasks List</span>
            </Link>
          </li>
          <li>
            <Link
              href="/users"
              className={`flex items-center p-2 rounded-lg ${
                isActive("/users")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Users</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => setIsMoneyManagementOpen(!isMoneyManagementOpen)}
              className={`flex items-center justify-between w-full p-2 rounded-lg ${
                pathname.includes("/money")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-3" />
                <span>Money Management</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMoneyManagementOpen ? "rotate-180" : ""}`} />
            </button>
            {isMoneyManagementOpen && (
              <ul className="pl-10 mt-1 space-y-1">
                <li>
                  <Link
                    href="/money/added"
                    className={`flex items-center p-2 rounded-lg ${
                      isActive("/money/added")
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>Added Money</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/money/withdraw"
                    className={`flex items-center p-2 rounded-lg ${
                      isActive("/money/withdraw")
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>Withdraw Money</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/settings"
              className={`flex items-center p-2 rounded-lg ${
                isActive("/settings")
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
