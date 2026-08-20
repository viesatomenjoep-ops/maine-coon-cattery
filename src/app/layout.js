import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { StoreProvider } from '@/context/StoreContext';

export const metadata = {
  title: 'Mainbreed · Software voor fokkers',
  description: 'Mainbreed is het beheerplatform voor hoogwaardige fokkers — nestjes, dossiers, gezondheid en verkoop op één plek. Nu voor Maine Coon-catteries, gebouwd voor alle rassen.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className="scroll-smooth scroll-pt-[140px] md:scroll-pt-[120px]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&family=Quicksand:wght@500;600;700&display=swap"
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
