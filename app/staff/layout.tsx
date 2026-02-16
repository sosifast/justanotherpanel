import React from 'react';

// Prevent Next.js from statically prerendering staff routes at build time.
export const dynamic = 'force-dynamic';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
