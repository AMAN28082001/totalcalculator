'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserRole } from '@/lib/auth';
import RoleSelector from './RoleSelector';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      const role = getUserRole();
      setIsAuth(auth);
      setUserRole(role);
      setLoading(false);
      
      if (!auth) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  // If agent is logged in but hasn't selected a role yet
  if (userRole === 'agent') {
    return <RoleSelector />;
  }

  return <>{children}</>;
}

