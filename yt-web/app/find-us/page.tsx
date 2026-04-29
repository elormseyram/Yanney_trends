import Image from "next/image";
import { SHOP_ADDRESS } from "@/lib/constants";
import { SHOP_HOURS, SITE_EMAIL, SHOP_PHONE_DISPLAY } from "@/lib/site";

const galleryInside = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
];

const galleryOutside = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop",
];

/** Embed centred on Dansoman, Accra (approx.) */
const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=5.576,-0.245&z=14&output=embed&hl=en";

export default function FindUsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="font-jost text-[10px] uppercase tracking-[0.28em] text-brand-muted">
        Visit
      </p>
      <h1 className="mt-2 font-playfair text-3xl text-brand-text md:text-4xl">
        Find us
      </h1>
      <p className="mt-4 max-w-2xl font-jost text-sm leading-relaxed text-brand-muted">
        Step inside for fittings and fabric — or shop online for delivery across Ghana. Replace the
        gallery below with your boutique photos when ready.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 font-jost text-sm text-brand-text">
          <p>{SHOP_ADDRESS}</p>
          <p className="text-brand-muted">{SHOP_HOURS}</p>
          <p>
            <a href={`mailto:${SITE_EMAIL}`} className="hover:text-brand-pink">
              {SITE_EMAIL}
            </a>
          </p>
          <p>{SHOP_PHONE_DISPLAY}</p>
        </div>
        <div className="aspect-video w-full min-h-[220px] overflow-hidden rounded-xl border border-brand-border">
          <iframe
            title="Yanney Trends location"
            className="h-full min-h-[220px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={MAP_EMBED_SRC}
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-14">
        <p className="font-bebas text-sm tracking-widest text-brand-pink">INSIDE THE BOUTIQUE</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {galleryInside.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden border border-brand-border bg-brand-elevated"
            >
              <Image src={src} alt={`Boutique interior ${i + 1}`} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <p className="font-bebas text-sm tracking-widest text-brand-pink">OUTSIDE THE BOUTIQUE</p>
        <p className="mt-2 max-w-2xl font-jost text-sm text-brand-muted">
          Street-level views and neighbourhood context — swap for your real storefront shots.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {galleryOutside.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden border border-brand-border bg-brand-elevated"
            >
              <Image src={src} alt={`Boutique exterior ${i + 1}`} fill className="object-cover" sizes="(max-width:640px) 100vw, 33vw" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
