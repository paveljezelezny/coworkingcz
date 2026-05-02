import { PDAdminLayout, type PDAdminNavItem } from '@/components/paper-diary/PDAdminLayout';

const NAV: PDAdminNavItem[] = [
  { href: '/admin',           label: 'Dashboard',  icon: '📊', exact: true },
  { href: '/admin/uzivatele', label: 'Uživatelé',  icon: '👥' },
  { href: '/admin/zadosti',   label: 'Žádosti',    icon: '📨' },
  { href: '/admin/eventy',    label: 'Eventy',     icon: '📅' },
  { href: '/admin/inzeraty',  label: 'Inzeráty',   icon: '🏷️' },
  { href: '/admin/pridat',    label: 'Přidat coworking', icon: '➕' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PDAdminLayout
      drawerLabel="šuplík super admin"
      sectionTitle="Super Admin Panel"
      sectionSubtitle="Správa celé platformy COWORKINGS.cz"
      navItems={NAV}
    >
      {children}
    </PDAdminLayout>
  );
}
