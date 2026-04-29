import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-bebas text-6xl tracking-widest text-brand-pink">404</p>
      <h1 className="mt-4 font-playfair text-2xl text-brand-text">This page drifted off the runway</h1>
      <p className="mt-3 font-jost text-sm text-brand-muted">
        The link may be old, or the piece sold out. Let’s get you back to the collection.
      </p>
      <Link
        href="/shop"
        className="mt-8 rounded-lg bg-brand-pink px-8 py-3 font-jost text-sm font-semibold text-black hover:bg-brand-pink-hover"
      >
        Shop the collection
      </Link>
      <Link href="/" className="mt-4 font-jost text-sm text-brand-muted hover:text-brand-pink">
        Home
      </Link>
    </div>
  );
}
