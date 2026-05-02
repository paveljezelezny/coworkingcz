import { PDAdminLayout, type PDAdminNavItem } from '@/components/paper-diary/PDAdminLayout';

const NAV: PDAdminNavItem[] = [
  { href: '/profil', label: 'Můj profil', icon: '👤', exact: true },
  { href: '/profil/cow-os', label: 'Členství COW.OS', icon: '🐄' },
];

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <PDAdminLayout
      drawerLabel="šuplík coworkera"
      sectionTitle="Můj profil"
      sectionSubtitle="Profil v adresáři, marketplace, eventy, doklady"
      navItems={NAV}
    >
      {children}
    </PDAdminLayout>
  );
}
