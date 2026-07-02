import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { StoreProvider } from '@/context/StoreContext';

export const metadata = {
  title: "Wendy's Dream · Maine Coon Cattery",
  description: 'Een oase van rust en pure liefde voor de majestueuze Maine Coon.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className="scroll-smooth scroll-pt-[140px] md:scroll-pt-[120px]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased relative">
        <StoreProvider>
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
          </LanguageProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
