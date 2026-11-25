import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { dbConnect } from '@/lib/mongodb';
import Settings from '@/models/Settings';

async function getWhatsAppSettings() {
  try {
    await dbConnect();
    const s = await Settings.findOne({ key: 'global' })
      .select('whatsapp whatsappMessage whatsappButtonText')
      .lean();
    return s || {};
  } catch (err) {
    console.error('WhatsApp settings error:', err);
    return {};
  }
}

export default async function ShopLayout({ children }) {
  const s = await getWhatsAppSettings();

  const phone = (s.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP || '919976449441').replace(/\D/g, '');
  const message = s.whatsappMessage ?? "Hi! I'd like to know more about your products.";
  const label = s.whatsappButtonText ?? 'Chat with us';

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton phone={phone} message={message} label={label} />
    </>
  );
}