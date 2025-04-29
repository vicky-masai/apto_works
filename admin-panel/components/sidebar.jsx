"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Wallet,
  Settings,
  LogOut,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation"
export default function Sidebar({ isOpen, onClose, isMobile }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (path) => {
    return pathname === path
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
    },
    {
      title: "Tasks",
      icon: Briefcase,
      href: "/tasks",
    },
    {
      title: "Money Management",
      icon: Wallet,
      items: [
        {
          title: "Added Money",
          href: "/money/added",
        },
        {
          title: "Withdrawals",
          href: "/money/withdrawals",
        },
        {
          title: "UPI Management",
          href: "/upi-management",
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]
  const handleLogout = () => {
    Cookies.remove("adminToken");
    localStorage.removeItem("token");
    router.push("/");
    router.refresh();
  };


  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 pt-16 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${!isMobile && 'lg:translate-x-0'}`}
    >
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex flex-col h-full">
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.items ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <div className="flex items-center text-sm font-medium text-gray-500">
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.title}
                      </div>
                    </div>
                    <ul className="space-y-1 pl-7">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-md text-sm ${
                              isActive(subItem.href)
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={isMobile ? onClose : undefined}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleLogout()}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
