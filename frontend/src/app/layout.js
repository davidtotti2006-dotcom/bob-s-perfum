import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import Preloader from '@/components/ui/Preloader';
import './globals.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata = {
  title: {
    default: "Bob's Paris — L'art de l'invisible",
    template: "%s | Bob's Paris",
  },
  description:
    "Haute Parfumerie — Paris & Abidjan. Des fragrances d'exception pour les âmes singulières.",
  icons: {
    icon: '/bobs-favicon.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        <Preloader />
        <Navbar />
        <CartDrawer />
        {children}
        <Footer />
      </body>
    </html>
  );
}
