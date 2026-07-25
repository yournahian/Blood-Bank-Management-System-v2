'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  UserCheck,
  Users,
  UserX,
  Sparkles,
  Package,
  Clock,
  TrendingUp,
  Droplet,
  History,
  CreditCard,
  MessageSquare,
  LogOut,
  Bot,
  Building2,
  ClipboardList,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<string>('admin');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const isAuth = localStorage.getItem('bbms_authenticated') === 'true';
    if (!isAuth) {
      router.push('/');
    } else {
      setAuthenticated(true);
      setRole(localStorage.getItem('bbms_role') || 'admin');
    }
  }, [router]);

  const handleLogout = () => {
    if (confirm('Do you really want to logout?')) {
      localStorage.removeItem('bbms_authenticated');
      router.push('/');
    }
  };

  const menuCategories = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'DONORS',
      items: [
        { name: 'Add New Donor', path: '/dashboard/donors/add', icon: UserPlus },
        { name: 'Update / Search', path: '/dashboard/donors/update', icon: UserCheck },
        { name: 'All Donors & Search', path: '/dashboard/donors/all', icon: Users },
        { name: 'Delete Donor', path: '/dashboard/donors/delete', icon: UserX },
      ],
    },
    {
      title: 'SEARCH & AI',
      items: [
        { name: 'Intelligent Matcher', path: '/dashboard/search/matcher', icon: Sparkles },
      ],
    },
    {
      title: 'STOCK',
      items: [
        { name: 'Manage Stock', path: '/dashboard/stock/manage', icon: Package },
        { name: 'Check Expiry', path: '/dashboard/stock/expiry', icon: Clock },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'AI Supply Prediction', path: '/dashboard/analytics/predict', icon: TrendingUp },
      ],
    },
    {
      title: 'B2B INTEGRATION',
      items: [
        { name: 'Hospital Portal', path: '/dashboard/hospital', icon: Building2 },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Manage Requisitions', path: '/dashboard/operations/request', icon: ClipboardList },
        { name: 'Delivery History', path: '/dashboard/operations/history', icon: History },
        { name: 'Generate ID Card', path: '/dashboard/operations/id-card', icon: CreditCard },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { name: 'Help Desk / Chat', path: '/dashboard/help-desk', icon: MessageSquare },
      ],
    },
  ];

  if (authenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <aside className="no-print" style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        overflowY: 'auto',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#cc0033',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplet size={22} fill="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.2 }}>
              Blood Bank
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Management System
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
          {menuCategories.filter(cat => {
            if (role === 'hospital') {
              return cat.title === 'B2B INTEGRATION' || cat.title === 'SUPPORT';
            }
            return cat.title !== 'B2B INTEGRATION';
          }).map((cat, i) => (
            <div key={i} style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                padding: '0.25rem 0.75rem 0.5rem 0.75rem',
                letterSpacing: '0.05em'
              }}>
                {cat.title}
              </div>
              {cat.items.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? '#6c63ff' : 'var(--text-main)',
                      backgroundColor: isActive ? (theme === 'dark' ? '#2e2b5e' : '#f1f0ff') : 'transparent',
                      textDecoration: 'none',
                      marginBottom: '2px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={18} color={isActive ? '#6c63ff' : 'var(--text-muted)'} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {isActive && <ChevronRight size={14} color="#6c63ff" />}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* System Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', padding: '0.25rem 0.75rem 0.5rem 0.75rem' }}>
              SYSTEM
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header className="no-print" style={{
          height: '70px',
          backgroundColor: 'var(--header-bg)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-title)' }}>
              Dashboard Overview
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} color="#f59e0b" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} color="#6c63ff" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard/help-desk"
              className="btn btn-primary"
              style={{
                textDecoration: 'none',
                borderRadius: '20px',
                padding: '0.5rem 1.25rem',
                backgroundColor: '#6c63ff',
                boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)'
              }}
            >
              <Bot size={18} />
              Chat Assistant
            </Link>
          </div>
        </header>

        {/* Dynamic Screen View */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
