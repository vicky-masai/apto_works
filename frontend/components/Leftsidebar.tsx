import React, { useState, createContext, useContext, useEffect } from 'react';
import { 
  LayoutDashboard,
  PlusSquare,
  ListTodo,
  DollarSign,
  Wallet,
  UserCircle,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  ListChecks
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getBalance } from '@/API/money_api';
import { currencyTypes } from '@/utils/currencyTypes';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface LeftsidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

const Leftsidebar: React.FC<LeftsidebarProps> = ({ sidebarOpen = false, setSidebarOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getBalance();
        setBalance(response.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '256px' : '80px');
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.clear();
    router.push("/");
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '256px');
  }, []);

  const menuItems: SidebarItem[] = [
    { title: 'Dashboard', icon: <LayoutDashboard className="w-6 h-6" />, path: '/dashboard' },
    { title: 'Tasks', icon: <ListChecks className="w-6 h-6" />, path: '/tasks' },
    { title: 'Post a Task', icon: <PlusSquare className="w-6 h-6" />, path: '/post-task' },
    { title: 'My Posted Tasks', icon: <ListTodo className="w-6 h-6" />, path: '/provider/tasks' },
    { title: 'Earnings', icon: <DollarSign className="w-6 h-6" />, path: '/earnings' },
    { title: 'Wallet', icon: <Wallet className="w-6 h-6" />, path: '/wallet' },
    { title: 'Profile', icon: <UserCircle className="w-6 h-6" />, path: '/profile' },
  ];

  // Responsive sidebar: overlay on mobile, fixed on desktop
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}
      <div
        className={`
          h-screen bg-white shadow-lg transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          fixed left-0 top-0 z-50 flex flex-col border-r border-gray-200
          md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:!translate-x-0
        `}
        style={{
          transition: 'transform 0.3s',
        }}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 md:hidden"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        >
          <PanelLeftClose className="w-6 h-6" />
        </button>
        {/* Toggle Button (desktop only) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 bg-white rounded-full p-1.5 border border-gray-200 cursor-pointer hidden md:block"
        >
          {isCollapsed ?
            <PanelLeftOpen className="w-4 h-4 text-gray-600" /> :
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          }
        </button>
        {/* Logo and Website Name */}
        <Link href="/" className="block">
          <div className="p-4 flex items-center justify-center border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Briefcase className={`${isCollapsed ? 'w-6 h-6' : 'w-8 h-8'}`} />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-gray-900">Apto</span>
                  <span className="text-sm text-gray-600 -mt-1">Works</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        {/* Wallet Status */}
        <div className={`mx-4 my-4 bg-blue-50 rounded-lg p-3 ${isCollapsed ? 'text-center' : ''}`}>
          <div className="flex items-center justify-center mb-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            {!isCollapsed && <span className="ml-2 font-medium text-blue-600">Wallet</span>}
          </div>
          <div className={`text-blue-700 text-center font-bold ${isCollapsed ? 'text-sm' : 'text-lg'}`}>
            {currencyTypes[0]?.symbol}{balance.toFixed(2)}
          </div>
        </div>
        {/* Menu Items */}
        <nav className="flex-1 px-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <Link
                href={item.path}
                key={index}
                className={`
                  flex items-center rounded-lg p-3 mb-1
                  transition-colors
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  ${isActive
                    ? 'bg-[#EFF6FF] text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <div className={isActive ? 'text-blue-600' : 'text-gray-600'}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="ml-3">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              w-full text-gray-700 rounded-lg p-3
              hover:bg-gray-100 transition-colors
              flex items-center
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <LogOut className="w-6 h-6" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Leftsidebar;