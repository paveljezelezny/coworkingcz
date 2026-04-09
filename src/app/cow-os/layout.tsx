import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'COW.OS — Operační systém pro váš coworking | Coworkings.cz',
  description:
    'Správa členů, automatická fakturace, QR platby a přehled o vašem podnikání. COW.OS je operační systém pro moderní coworkingy.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
