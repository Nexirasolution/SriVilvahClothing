import PolicyLayout from '@/components/PolicyLayout';

export const metadata = {
  title: 'Shipping Policy',
  description: 'Order processing, delivery times and tracking information.',
};

const sections = [
  {
    title: 'Order Processing',
    items: [
      {
        label: 'Dispatch',
        text: 'All orders are dispatched within 1–2 business days from our store in Saravanampatti, Coimbatore.',
      },
    ],
  },
  {
    title: 'Delivery Time',
    items: [
      { label: 'Tamil Nadu & South India', text: '2–5 business days' },
      { label: 'Rest of India', text: '4–7 business days' },
    ],
  },
  {
    title: 'Tracking',
    items: [
      {
        text: 'Once shipped, use the tracking details to track your order.',
      },
    ],
  },
];

export default function ShippingPolicyPage() {
  return <PolicyLayout title="Shipping Policy" sections={sections} />;
}