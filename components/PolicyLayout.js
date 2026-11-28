import { Fraunces, Inter } from 'next/font/google';

const display = Fraunces({ subsets: ['latin'], weight: ['400'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });

const PAPER = '#FFFFFF';
const NAVY = '#102A56';
const NAVY_DARK = '#071A3A';
const GOLD = '#C9A227';
const GOLD_PALE = '#E6D39A';
const GREY = 'rgba(16, 42, 86, 0.75)';

// sections: [{ title, intro?, items: [{ label?, text?, subitems?: string[] }] }]
export default function PolicyLayout({ title, sections }) {
  return (
    <div className={`${body.className} ${display.variable}`} style={{ background: PAPER }}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <h1
          className={`${display.className} text-[28px] sm:text-[36px] leading-tight pb-4 mb-8`}
          style={{ color: NAVY_DARK, fontWeight: 400, borderBottom: `2px solid ${GOLD}` }}
        >
          {title}
        </h1>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2
                className="text-[11px] font-medium uppercase tracking-[0.18em] mb-4 pb-2"
                style={{ color: NAVY_DARK, borderBottom: `1px solid ${GOLD_PALE}` }}
              >
                {section.title}
              </h2>

              <ul className="space-y-4 text-sm leading-relaxed" style={{ color: GREY }}>
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                      style={{ background: GOLD }}
                    />
                    <div>
                      {item.label && (
                        <span className="font-semibold" style={{ color: NAVY_DARK }}>
                          {item.label}:{' '}
                        </span>
                      )}
                      {item.text}
                      {item.subitems && (
                        <ul className="mt-2 space-y-1.5">
                          {item.subitems.map((sub, j) => (
                            <li key={j} className="flex gap-2">
                              <span style={{ color: GOLD }}>•</span>
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}