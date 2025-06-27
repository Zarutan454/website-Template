import React from 'react';
import { Home, Users, MessageSquare, Wallet, Bell, Settings, Zap, PlusCircle } from 'lucide-react';

export interface SidebarLink {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export const sidebarLinks = [
  {
    title: 'Home',
    icon: <Home size={18} />,
    path: '/',
  },
  {
    title: 'Freunde',
    icon: <Users size={18} />,
    path: '/friends',
  },
  {
    title: 'Nachrichten',
    icon: <MessageSquare size={18} />,
    path: '/messages',
  },
  {
    title: 'Wallet',
    icon: <Wallet size={18} />,
    path: '/wallet'
  },
  {
    title: 'Benachrichtigungen',
    icon: <Bell size={18} />,
    path: '/notifications',
  },
  {
    title: 'Token erstellen',
    icon: <PlusCircle size={18} />,
    path: '/create-token',
    badge: 'Neu'
  },
  {
    title: 'Einstellungen',
    icon: <Settings size={18} />,
    path: '/settings',
  },
];
