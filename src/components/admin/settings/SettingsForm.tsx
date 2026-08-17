"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/admin/settings";
import { ChangePasswordForm } from "@/components/admin/settings/ChangePasswordForm";
import type { SiteSettings } from "@/lib/domain";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [siteName, setSiteName] = useState(settings.site_name ?? "");
  const [businessPhone, setBusinessPhone] = useState(settings.business_phone ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number ?? "");
  const [whatsappTemplate, setWhatsappTemplate] = useState(settings.whatsapp_message_template ?? "");
  const [businessEmail, setBusinessEmail] = useState(settings.business_email ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [mapEmbed, setMapEmbed] = useState(settings.google_map_embed ?? "");
  const [instagram, setInstagram] = useState(settings.social_links?.instagram ?? "");
  const [facebook, setFacebook] = useState(settings.social_links?.facebook ?? "");
  const [youtube, setYoutube] = useState(settings.social_links?.youtube ?? "");
  const [metaTitle, setMetaTitle] = useState(settings.default_meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(settings.default_meta_description ?? "");
  const [ga4Id, setGa4Id] = useState(settings.ga4_measurement_id ?? "");

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateSettings({
        site_name: siteName,
        business_phone: businessPhone,
        whatsapp_number: whatsappNumber,
        whatsapp_message_template: whatsappTemplate,
        business_email: businessEmail,
        address,
        google_map_embed: mapEmbed || null,
        social_links: { instagram, facebook, youtube },
        default_meta_title: metaTitle,
        default_meta_description: metaDescription,
        ga4_measurement_id: ga4Id.trim() || null,
      });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Business identity</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Site name</span>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input mt-1.5" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Business phone</span>
              <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="input mt-1.5" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Business email</span>
              <input value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="input mt-1.5" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input mt-1.5" />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">WhatsApp</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">WhatsApp number</span>
            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Digits only, e.g. 910000000000"
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Default quote message template</span>
            <textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              rows={2}
              className="input mt-1.5"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Social links</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Instagram</span>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://…" className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Facebook</span>
            <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://…" className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">YouTube</span>
            <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://…" className="input mt-1.5" />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Homepage SEO defaults</p>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Default meta title</span>
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Default meta description</span>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Google Map embed URL (optional)</span>
            <input value={mapEmbed ?? ""} onChange={(e) => setMapEmbed(e.target.value)} className="input mt-1.5" />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Analytics</p>
        <div className="mt-4 space-y-2">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Google Analytics measurement ID</span>
            <input
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="input mt-1.5 font-mono text-sm"
            />
          </label>
          <p className="text-xs text-gray-400">
            From your GA4 property at{" "}
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-gray-600"
            >
              analytics.google.com
            </a>{" "}
            (Admin → Data Streams → your web stream). Leave blank to disable tracking.
          </p>
        </div>
      </section>

      <ChangePasswordForm />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-gray-200 bg-white/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save settings"}
        </button>
        {saved && !isPending && <span className="text-sm text-emerald-600">Saved — changes are live sitewide</span>}
      </div>
    </div>
  );
}
