import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBar } from '../../components/layout/DemoBar';

export const PublicShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1E8D0] text-[#2B2620]">
      <DemoBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

