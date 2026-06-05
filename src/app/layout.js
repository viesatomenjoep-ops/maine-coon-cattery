import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Maelduin · Maine Coon Cattery',
  description: 'Exclusieve Maine Coon kittens met liefde grootgebracht.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Jost:wght@300..600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased relative">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
