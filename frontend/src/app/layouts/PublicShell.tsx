import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2B2620]">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
