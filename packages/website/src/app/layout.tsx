import './globals.css';
import type { Metadata } from 'next';
import { Lilita_One } from 'next/font/google';

const lilitaOne = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  preload: true,
  variable: '--lilita',
});

export const metadata: Metadata = {
  title: 'Motioned',
  description: 'The animation toolkit for web devs and designers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Batteries included animation library for React + devtools + Figma plugin. Based on WAAPI."
        />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/x-icon" href="/motioned/favicon.svg" />
        <title>Motioned</title>
      </head>
      <body
        className={`${lilitaOne.variable} bg-gradient-to-b from-gray-950 to-gray-800`}
      >
        {children}
      </body>
    </html>
  );
}
