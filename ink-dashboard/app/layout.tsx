// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ink dashboard',
  description: 'ink portfolio view',
};

export default function RootLayout(
  props: { children: React.ReactNode }
) {
  return (
    <html lang='en'>
      <body>
        <div className='app'>
          {props.children}
        </div>
      </body>
    </html>
  );
}
