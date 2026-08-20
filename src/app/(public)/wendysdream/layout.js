import PublicShell from './PublicShell';

export const metadata = {
  title: "Wendy's Dream · Maine Coon Cattery",
  description: 'Een oase van rust en pure liefde voor de majestueuze Maine Coon.',
};

export default function WendysDreamLayout({ children }) {
  return <PublicShell>{children}</PublicShell>;
}
