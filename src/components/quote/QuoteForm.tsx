"use client";

import { useActionState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { submitEnquiry, type EnquiryFormState } from "@/app/actions/submit-enquiry";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/domain";

// ---------------------------------------------------------------------------
// Field options
// ---------------------------------------------------------------------------
const EVENT_TYPES = [
  "Wedding",
  "Reception",
  "Engagement",
  "Birthday",
  "Baby Shower",
  "Corporate Event",
  "Stage & Backdrop",
  "Other",
];

const BUDGET_RANGES = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "₹5,00,000+",
];

const CONTACT_TIMES = ["Morning (9 am – 12 pm)", "Afternoon (12 pm – 4 pm)", "Evening (4 pm – 8 pm)"];

// ---------------------------------------------------------------------------
// Shared input primitives
// ---------------------------------------------------------------------------

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1.5 text-[0.72rem] text-red-600">
      {errors[0]}
    </p>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: string[];
  required?: boolean;
};

function Input({ label, name, errors, required, ...rest }: InputProps) {
  const id = `qf-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[0.78rem] font-medium text-charcoal">
        {label}
        {required && <span className="ml-0.5 text-accent" aria-hidden> *</span>}
      </label>
      <input
        id={id}
        name={name}
        {...rest}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-err` : undefined}
        className={`rounded-xl border bg-white px-4 py-3 text-sm text-charcoal outline-none ring-0 transition-all placeholder:text-stone focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          hasError ? "border-red-400" : "border-line"
        }`}
      />
      {hasError && (
        <p id={`${id}-err`} role="alert" className="mt-0.5 text-[0.72rem] text-red-600">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: string[];
  errors?: string[];
  placeholder?: string;
};

function Select({ label, name, options, errors, placeholder, ...rest }: SelectProps) {
  const id = `qf-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[0.78rem] font-medium text-charcoal">
        {label}
      </label>
      <select
        id={id}
        name={name}
        {...rest}
        aria-invalid={hasError}
        defaultValue=""
        className={`rounded-xl border bg-white px-4 py-3 text-sm text-charcoal outline-none ring-0 transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          hasError ? "border-red-400" : "border-line"
        }`}
      >
        <option value="" disabled>
          {placeholder ?? `Select ${label.toLowerCase()}`}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldError errors={errors} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success panel
// ---------------------------------------------------------------------------

function SuccessPanel({
  waUrl,
  onReset,
}: {
  waUrl: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-line bg-porcelain px-8 py-16 text-center">
      <span className="text-4xl text-accent" aria-hidden>
        ✦
      </span>
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl">
          Your enquiry has been received!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone">
          WhatsApp is opening so we can continue the conversation. We&apos;ll get back to you
          quickly — usually within a few hours.
        </p>
      </div>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Open WhatsApp
      </a>
      <button
        type="button"
        onClick={onReset}
        className="text-sm text-stone underline-offset-4 hover:text-charcoal hover:underline"
      >
        Submit another enquiry
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

type Props = { settings: SiteSettings };

const initialState: EnquiryFormState | null = null;

export function QuoteForm({ settings }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(submitEnquiry, initialState);

  // On success: open WhatsApp automatically
  useEffect(() => {
    if (state?.ok && state.enquiryId !== "honeypot") {
      const summary = `Hi 3 Star Decoration! I've just submitted a quote request. Looking forward to hearing from you.`;
      const wa = whatsappUrl(settings.whatsapp_number, summary);
      window.open(wa, "_blank", "noopener,noreferrer");
    }
  }, [state, settings.whatsapp_number]);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state ? state.fieldErrors ?? {} : {};

  // Build the WhatsApp URL for the success panel (same as auto-open)
  const waUrl = whatsappUrl(
    settings.whatsapp_number,
    `Hi 3 Star Decoration! I've just submitted a quote request. Looking forward to hearing from you.`,
  );

  // Success state
  if (state?.ok && state.enquiryId !== "honeypot") {
    return (
      <section className="py-section">
        <Container className="max-w-2xl">
          <SuccessPanel waUrl={waUrl} onReset={() => formRef.current?.reset()} />
        </Container>
      </section>
    );
  }

  return (
    <section className="py-section">
      <Container>
        <form
          ref={formRef}
          action={action}
          noValidate
          className="mx-auto max-w-3xl"
          aria-label="Quote request form"
        >
          {/* Hidden source field */}
          <input type="hidden" name="source" value="quote_form" />

          {/* Honeypot — visually hidden, never filled by real users */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
            <label htmlFor="qf-hp">Leave this empty</label>
            <input
              id="qf-hp"
              name="_hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Form header */}
          <div className="mb-10">
            <p className="eyebrow">Your details</p>
            <p className="mt-2 text-sm text-stone">
              Fields marked <span className="text-accent">*</span> are required.
            </p>
          </div>

          {/* Global error */}
          {state && !state.ok && (
            <div
              role="alert"
              className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          {/* ── Row 1: Name + Phone ── */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Full Name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Priya Sharma"
              required
              errors={fieldErrors.name}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              required
              errors={fieldErrors.phone}
            />
          </div>

          {/* ── Row 2: Email ── */}
          <div className="mt-5">
            <Input
              label="Email Address (optional)"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="priya@example.com"
              errors={fieldErrors.email}
            />
          </div>

          {/* ── Divider ── */}
          <div className="my-8 border-t border-line" />
          <p className="eyebrow mb-6">Event details</p>

          {/* ── Row 3: Event Type + Date ── */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Event Type"
              name="event_type"
              options={EVENT_TYPES}
              placeholder="Select occasion"
              errors={fieldErrors.event_type}
            />
            <Input
              label="Event Date"
              name="event_date"
              type="date"
              errors={fieldErrors.event_date}
            />
          </div>

          {/* ── Row 4: City + Venue ── */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input
              label="Event City"
              name="event_city"
              type="text"
              placeholder="Chennai"
              errors={fieldErrors.event_city}
            />
            <Input
              label="Venue / Hall Name"
              name="venue"
              type="text"
              placeholder="Grand Ballroom, Taj"
              errors={fieldErrors.venue}
            />
          </div>

          {/* ── Row 5: Guests + Budget + Contact Time ── */}
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Input
              label="Approx. Guest Count"
              name="guest_count"
              type="number"
              min="1"
              placeholder="150"
              errors={fieldErrors.guest_count}
            />
            <Select
              label="Budget Range"
              name="budget_range"
              options={BUDGET_RANGES}
              placeholder="Select range"
              errors={fieldErrors.budget_range}
            />
            <Select
              label="Best Time to Call"
              name="preferred_contact_time"
              options={CONTACT_TIMES}
              placeholder="Select time"
              errors={fieldErrors.preferred_contact_time}
            />
          </div>

          {/* ── Message ── */}
          <div className="mt-5">
            <label htmlFor="qf-message" className="text-[0.78rem] font-medium text-charcoal">
              Tell us more (optional)
            </label>
            <textarea
              id="qf-message"
              name="message"
              rows={4}
              placeholder="Theme ideas, colour palette, specific requirements..."
              className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm text-charcoal outline-none ring-0 transition-all placeholder:text-stone focus:border-accent focus:ring-2 focus:ring-accent/20 ${
                fieldErrors.message?.length ? "border-red-400" : "border-line"
              }`}
            />
            <FieldError errors={fieldErrors.message} />
          </div>

          {/* ── Submit ── */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-ivory transition-all hover:bg-accent-deep disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/30 border-t-ivory"
                    aria-hidden
                  />
                  Sending…
                </>
              ) : (
                <>
                  Send enquiry & open WhatsApp <span aria-hidden>→</span>
                </>
              )}
            </button>
            <p className="text-[0.72rem] text-stone">
              By submitting you agree to be contacted by 3 Star Decoration about your enquiry.
            </p>
          </div>
        </form>
      </Container>
    </section>
  );
}
