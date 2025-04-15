'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const isLoginPage = pathname === '/login';

      if (!adminToken && !isLoginPage) {
        router.push('/login');
      }

      if (adminToken && isLoginPage) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [pathname, router]);

  return null;
} 