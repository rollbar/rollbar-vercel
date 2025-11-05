import './globals.css';

export const metadata = {
  title: 'Rollbar Next.js Starter Kit',
  description: 'Ship faster with confidence — kickstart error monitoring in your Next.js app with Rollbar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
