import React from 'react';
import { Settings as SettingsIcon, User, Database, Palette, Bell, Shield, Globe, Monitor, FileText, Zap, Bot } from 'lucide-react';
import { SettingsSection } from './types';

export const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General',
    icon: React.createElement(SettingsIcon, { className: "h-4 w-4" })
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: React.createElement(User, { className: "h-4 w-4" })
  },
  {
    id: 'ai-models',
    title: 'AI Models',
    icon: React.createElement(Bot, { className: "h-4 w-4" }),
    badge: 'New',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: React.createElement(Palette, { className: "h-4 w-4" }),
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: React.createElement(Bell, { className: "h-4 w-4" }),
  },
  {
    id: 'security',
    title: 'Security',
    icon: React.createElement(Shield, { className: "h-4 w-4" }),
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: React.createElement(Database, { className: "h-4 w-4" }),
  },
  {
    id: 'language',
    title: 'Language & Region',
    icon: React.createElement(Globe, { className: "h-4 w-4" }),
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: React.createElement(Zap, { className: "h-4 w-4" }),
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: React.createElement(Monitor, { className: "h-4 w-4" }),
  },
  {
    id: 'about',
    title: 'About',
    icon: React.createElement(FileText, { className: "h-4 w-4" }),
  },
];
