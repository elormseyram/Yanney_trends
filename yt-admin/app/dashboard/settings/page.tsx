import { redirect } from "next/navigation";
import { getHubRole } from "@/lib/hub-auth";
import { fetchShopSettings } from "@/lib/hub/queries";
import { HubTopBar } from "@/components/hub/HubTopBar";
import { QueryErrorBanner } from "@/components/hub/QueryErrorBanner";
import { updateShopSettings } from "@/app/actions/hub-settings";
import { FormFlash } from "@/components/hub/FormFlash";
import { AnnouncementField } from "@/components/hub/AnnouncementField";
import { MarqueeTickerField } from "@/components/hub/MarqueeTickerField";
import { AdminThemeSettings } from "@/components/hub/AdminThemeSettings";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; ok?: string }>;
}) {
  const role = await getHubRole();
  if (!role) return null;
  if (role !== "owner") {
    redirect(
      "/dashboard?err=" +
        encodeURIComponent("Shop settings are only available to owners. Ask an owner to update hours, fees, and contact details."),
    );
  }
  const flash = await searchParams;

  const res = await fetchShopSettings();
  const shop = res.ok ? res.data : null;

  return (
    <>
      <HubTopBar title="Shop settings" role={role} />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-4 sm:p-6">
        <FormFlash err={flash.err} ok={flash.ok} />
        {!res.ok ? <QueryErrorBanner message={res.message} /> : null}

        <p className="text-sm text-stone-600 dark:text-stone-400">
          Owner-only: public copy, delivery zones, announcements, and availability for the storefront.
        </p>

        {shop ? (
          <>
            <AdminThemeSettings />
            <form action={updateShopSettings} className="space-y-6">
              <input type="hidden" name="id" value={shop.id} />

            <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">Shop</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Public-facing copy and contact details.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="shop_name" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                    Shop name
                  </label>
                  <input
                    id="shop_name"
                    name="shop_name"
                    required
                    defaultValue={shop.shop_name}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                  />
                </div>
                <div>
                  <label htmlFor="tagline" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                    Tagline
                  </label>
                  <input
                    id="tagline"
                    name="tagline"
                    defaultValue={shop.tagline ?? ""}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                  />
                </div>
                <div>
                  <label
                    htmlFor="shop_address"
                    className="text-xs font-medium text-stone-600 dark:text-stone-400"
                  >
                    Address
                  </label>
                  <textarea
                    id="shop_address"
                    name="shop_address"
                    rows={2}
                    defaultValue={shop.shop_address ?? ""}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="whatsapp_number"
                      className="text-xs font-medium text-stone-600 dark:text-stone-400"
                    >
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp_number"
                      name="whatsapp_number"
                      defaultValue={shop.whatsapp_number ?? ""}
                      className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="instagram_handle"
                      className="text-xs font-medium text-stone-600 dark:text-stone-400"
                    >
                      Instagram
                    </label>
                    <input
                      id="instagram_handle"
                      name="instagram_handle"
                      defaultValue={shop.instagram_handle ?? ""}
                      className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                    />
                  </div>
                </div>
              </div>
            </section>

            <AnnouncementField
              defaultText={shop.announcement_text ?? ""}
              defaultActive={shop.announcement_active}
            />

            <MarqueeTickerField
              defaultText={shop.marquee_ticker_text ?? ""}
              defaultActive={Boolean(shop.marquee_ticker_active)}
            />

            <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">Order batch countdown</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Shoppers see a live countdown to this time on the home marquee and the shop banner (local time
                on their device).
              </p>
              <div className="mt-4">
                <label htmlFor="delivery_cutoff_time" className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  Daily cut-off time
                </label>
                <input
                  id="delivery_cutoff_time"
                  name="delivery_cutoff_time"
                  type="time"
                  required
                  defaultValue={
                    shop.delivery_cutoff_time
                      ? String(shop.delivery_cutoff_time).slice(0, 5)
                      : "20:00"
                  }
                  className="mt-1 block rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                />
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-stone-900 dark:text-stone-100">
                    Delivery zones
                  </h2>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    Rename the zones to match your areas (e.g. Inside Accra, Greater Accra) and set the
                    fee shown to shoppers at checkout.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {(
                  [
                    { key: "a", nameField: "zone_a_name", feeField: "zone_a_fee", defaultName: shop.zone_a_name, defaultFee: shop.zone_a_fee },
                    { key: "b", nameField: "zone_b_name", feeField: "zone_b_fee", defaultName: shop.zone_b_name, defaultFee: shop.zone_b_fee },
                    { key: "c", nameField: "zone_c_name", feeField: "zone_c_fee", defaultName: shop.zone_c_name, defaultFee: shop.zone_c_fee },
                  ] as const
                ).map((z) => (
                  <div key={z.key} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label
                        htmlFor={z.nameField}
                        className="text-xs font-medium text-stone-600 dark:text-stone-400"
                      >
                        Zone {z.key.toUpperCase()} — display name
                      </label>
                      <input
                        id={z.nameField}
                        name={z.nameField}
                        defaultValue={z.defaultName ?? `Zone ${z.key.toUpperCase()}`}
                        placeholder={`Zone ${z.key.toUpperCase()} (e.g. Inside Accra)`}
                        className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                      />
                    </div>
                    <div className="sm:w-40">
                      <label
                        htmlFor={z.feeField}
                        className="text-xs font-medium text-stone-600 dark:text-stone-400"
                      >
                        Delivery fee (GHS)
                      </label>
                      <input
                        id={z.feeField}
                        name={z.feeField}
                        type="number"
                        step="0.01"
                        min={0}
                        defaultValue={z.defaultFee ?? ""}
                        className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-950"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">Availability</h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Toggle what shoppers can do right now.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-700 dark:text-stone-200">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="shop_is_open" defaultChecked={shop.shop_is_open} />
                  Shop open
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="delivery_available"
                    defaultChecked={shop.delivery_available}
                  />
                  Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="pickup_available"
                    defaultChecked={shop.pickup_available}
                  />
                  Pickup
                </label>
              </div>
            </section>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Save shop settings
                </button>
              </div>
            </form>
          </>
        ) : res.ok && !shop ? (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Shop details are not set up yet. Whoever launched the site needs to add your opening hours, fees, and contact
            info once — then this form will appear.
          </p>
        ) : null}
      </main>
    </>
  );
}
