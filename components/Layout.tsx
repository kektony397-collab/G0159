
import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { WindowsLayout } from './os/WindowsLayout';
import { AndroidLayout } from './os/AndroidLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { os } = useThemeStore();

  return os === 'windows' ? (
    <WindowsLayout>{children}</WindowsLayout>
  ) : (
    <AndroidLayout>{children}</AndroidLayout>
  );
};
