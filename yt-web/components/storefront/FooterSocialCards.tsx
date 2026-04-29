import Image from "next/image";
import Link from "next/link";
import { SOCIAL_CARDS } from "@/lib/site";

const brandIcons: Record<string, string> = {
  ig: "https://cdn.simpleicons.org/instagram/E4405F",
  tt: "https://cdn.simpleicons.org/tiktok/000000",
  sc: "https://cdn.simpleicons.org/snapchat/FFFC00",
  wa: "https://cdn.simpleicons.org/whatsapp/25D366",
};

export function FooterSocialCards() {
  return (
    <div className="border-t border-brand-border bg-brand-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-muted">
          Connect
        </p>
        <p className="mt-2 font-playfair text-xl text-brand-text">Follow Yanney</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {SOCIAL_CARDS.map((s) => {
            const href = s.href;
            const iconSrc = brandIcons[s.id];
            return (
              <Link
                key={s.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-brand-elevated px-4 py-6 text-center transition-colors hover:border-brand-pink/50"
              >
                <span className="relative h-8 w-8 transition-transform group-hover:scale-105">
                  <Image src={iconSrc} alt="" width={32} height={32} className="object-contain" unoptimized />
                </span>
                <span className="font-jost text-xs font-medium uppercase tracking-wider text-brand-muted group-hover:text-brand-text">
                  {s.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
