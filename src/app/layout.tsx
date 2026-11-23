import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import InstallAppButton from '@/components/InstallAppButton';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Borneo Trans - Travel & Wisata Kalimantan',
  description: 'Ke Mana Pun Tujuanmu, Borneo Teman Perjalananmu',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1B4332',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.className} antialiased bg-slate-900 flex justify-center min-h-screen`}
      >
        <Script id="borneo-theme-init" strategy="beforeInteractive">
          {`
            try {
              var raw = localStorage.getItem('borneo_user_settings');
              if (raw && JSON.parse(raw).darkMode === true) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            } catch (e) {}
          `}
        </Script>
        <main className="w-full max-w-[430px] min-h-screen bg-[#E8F3EC] relative overflow-x-hidden shadow-2xl flex flex-col">
          <InstallAppButton />
          {children}
        </main>
      </body>
    </html>
  );
}