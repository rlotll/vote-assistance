import { DistrictGuard } from '@/components/DistrictGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DistrictGuard>{children}</DistrictGuard>;
}
