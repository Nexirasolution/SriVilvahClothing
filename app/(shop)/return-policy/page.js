import PolicyLayout from '@/components/PolicyLayout';

export const metadata = {
  title: 'Return & Exchange Policy',
  description: 'Size exchanges and what to do if you receive a damaged or wrong item.',
};

const sections = [
  {
    title: 'Size Exchange',
    items: [
      {
        text: 'We offer hassle-free size exchanges within 3 days of delivery, provided the garment is unused, unwashed, and has original tags intact.',
      },
    ],
  },
  {
    title: 'Damaged or Wrong Item',
    items: [
      {
        text: 'In the rare case you receive a defective or incorrect outfit, please share a full parcel opening video (from start to finish without cuts) on WhatsApp within 24 hours of delivery for a free replacement or full refund.',
      },
    ],
  },
];

export default function ReturnPolicyPage() {
  return <PolicyLayout title="Return & Exchange Policy" sections={sections} />;
}