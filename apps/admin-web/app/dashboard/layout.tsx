'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { checkAuth } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
    }
  }, [router]);

  return <AdminLayout>{children}</AdminLayout>;
}
