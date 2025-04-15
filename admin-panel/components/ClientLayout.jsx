'use client';

import Sidebar from "@/components/sidebar"
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className={`${isLoginPage ? '' : 'flex'} h-screen bg-gray-100 dark:bg-gray-900`}>
      {!isLoginPage && <Sidebar />}
      <main className={`${isLoginPage ? 'w-full' : 'flex-1'} overflow-auto ${isLoginPage ? '' : 'p-4'}`}>
        {children}
      </main>
    </div>
  );
} 