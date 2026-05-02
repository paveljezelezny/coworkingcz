import { PDAdminLayout, type PDAdminNavItem } from '@/components/paper-diary/PDAdminLayout';

const NAV: PDAdminNavItem[] = [
  { href: '/spravce', label: 'Moje coworkingy', icon: '🏢', exact: true },
  { href: '/cow-os', label: '🐄 O COW.OS' },
  { href: '/ceniky', label: 'Ceník platformy', icon: '💳' },
];

export default function SpravceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PDAdminLayout
      drawerLabel="šuplík správce"
      sectionTitle="Provozovatel"
      sectionSubtitle="Spravuj svůj coworking, členy, fakturaci"
      navItems={NAV}
    >
      {children}
    </PDAdminLayout>
  );
}
