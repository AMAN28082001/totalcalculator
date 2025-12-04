'use client';

import { useState } from 'react';
import { setUserRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'sales' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelect = (role: 'customer' | 'sales') => {
    setIsLoading(true);
    setUserRole(role);
    setSelectedRole(role);
    
    // Small delay to ensure localStorage is updated
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>CHAIRBORD PRIVATE LIMITED</h1>
          <h2>Select Mode</h2>
          <p>Choose how you want to proceed</p>
        </div>

        <div className="role-selector">
          <button
            className="role-button customer-button"
            onClick={() => handleRoleSelect('customer')}
            disabled={isLoading}
          >
            <div className="role-icon">👤</div>
            <div className="role-title">Customer</div>
            <div className="role-description">View prices normally</div>
          </button>

          <button
            className="role-button sales-button"
            onClick={() => handleRoleSelect('sales')}
            disabled={isLoading}
          >
            <div className="role-icon">💼</div>
            <div className="role-title">Sales</div>
            <div className="role-description">Hide prices and add markup</div>
          </button>
          
          {isLoading && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#667eea' }}>
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

