'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Cattery Overzicht is samengevoegd met het Startscherm.
export default function OverviewRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
