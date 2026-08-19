"use client";

import { useActionState, useEffect, useState } from "react";
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
// Form values — kept in React state (controlled inputs) rather than left
// uncontrolled, so a failed/invalid submission can never wipe out what the
// visitor already typed. Only the field(s) the server actually rejected get
// marked (red border); everything else stays exactly as entered.
// ---------------------------------------------------------------------------
type FormValues = {
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  event_city: string;
  venue: string;
  guest_count: string;
  budget_range: string;
  preferred_contact_time: string;
  message: string;
};

const EMPTY_VALUES: FormValues = {
  name: "",
  phone: "",
  email: "",
  event_type: "",
  event_date: "",
  event_city: "",
  venue: "",
  guest_count: "",
  budget_range: "",
  preferred_contact_time: "",
  message: "",
};

const FIELD_LABELS: Record<keyof FormValues, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  event_type: "Event type",
  event_date: "Event date",
  event_city: "City",
  venue: "Venue",
  guest_count: "Guest count",
  budget_range: "Budget",
  preferred_contact_time: "Preferred contact time",
  message: "Message",
};

/** Builds the WhatsApp message from whatever the visitor actually filled in. */
function buildWhatsAppMessage(values: FormValues): string {
  const lines = ["Hi 3 Star Decoration! I've just submitted a quote request:", ""];
  (Object.keys(FIELD_LABELS) as Array<keyof FormValues>).forEach((key) => {
    const value = values[key].trim();
    if (value) lines.push(`${FIELD_LABELS[key]}: ${value}`);
  });
  lines.push("", "Looking forward to hearing from you!");
  return lines.join("\n");
}

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

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  required?: boolean;
};

function Input({ label, name, value, onChange, errors, required, ...rest }: InputProps) {
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> & {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  errors?: string[];
  placeholder?: string;
};

function Select({ label, name, value, onChange, options, errors, placeholder, ...rest }: SelectProps) {
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        aria-invalid={hasError}
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
          WhatsApp is opening so we can continue the conversation — with everything you entered
          already filled in. We&apos;ll get back to you quickly, usually within a few hours.
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
  const [state, formAction, isPending] = useActionState(submitEnquiry, initialState);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);

  function setField<K extends keyof FormValues>(key: K) {
    return (value: string) => setValues((v) => ({ ...v, [key]: value }));
  }

  // Deliberately NOT using <form action={formAction}> — React resets the
  // native <select> elements' DOM value back to their default option after
  // an action-bound form submission completes (a documented React 19
  // behaviour for the action-integration path), and controlled re-rendering
  // doesn't repair it because the value in state hasn't actually changed.
  // Text inputs happen to survive that reset; selects don't. Driving the
  // submission through a plain onSubmit + manual dispatch sidesteps that
  // native form-reset path entirely, so every field — including selects —
  // reliably keeps what the visitor typed.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    formAction(new FormData(e.currentTarget));
  }

  // On success: send the FULL filled-in enquiry straight to WhatsApp too —
  // the admin panel already has it (submitEnquiry writes to the enquiries
  // table), this just gets the same details in front of the team instantly.
  useEffect(() => {
    if (state?.ok && state.enquiryId !== "honeypot") {
      const wa = whatsappUrl(settings.whatsapp_number, buildWhatsAppMessage(values));
      window.open(wa, "_blank", "noopener,noreferrer");
    }
    // Only re-run when the submission result changes — `values` is read at
    // that moment, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, settings.whatsapp_number]);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state ? state.fieldErrors ?? {} : {};

  const waUrl = whatsappUrl(settings.whatsapp_number, buildWhatsAppMessage(values));

  // Success state
  if (state?.ok && state.enquiryId !== "honeypot") {
    return (
      <section className="py-section">
        <Container className="max-w-2xl">
          <SuccessPanel waUrl={waUrl} onReset={() => setValues(EMPTY_VALUES)} />
        </Container>
      </section>
    );
  }

  return (
    <section className="py-section">
      <Container>
        <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl" aria-label="Quote request form">
          {/* Hidden source field */}
          <input type="hidden" name="source" value="quote_form" />

          {/* Honeypot — visually hidden, never filled by real users */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
            <label htmlFor="qf-hp">Leave this empty</label>
            <input id="qf-hp" name="_hp" type="text" tabIndex={-1} autoComplete="off" />
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
              {state.error} Everything you&apos;ve entered is still here — just fix the field(s)
              marked in red below and send it again.
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
              value={values.name}
              onChange={setField("name")}
              errors={fieldErrors.name}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              required
              value={values.phone}
              onChange={setField("phone")}
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
              value={values.email}
              onChange={setField("email")}
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
              value={values.event_type}
              onChange={setField("event_type")}
              errors={fieldErrors.event_type}
            />
            <Input
              label="Event Date"
              name="event_date"
              type="date"
              value={values.event_date}
              onChange={setField("event_date")}
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
              value={values.event_city}
              onChange={setField("event_city")}
              errors={fieldErrors.event_city}
            />
            <Input
              label="Venue / Hall Name"
              name="venue"
              type="text"
              placeholder="Grand Ballroom, Taj"
              value={values.venue}
              onChange={setField("venue")}
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
              value={values.guest_count}
              onChange={setField("guest_count")}
              errors={fieldErrors.guest_count}
            />
            <Select
              label="Budget Range"
              name="budget_range"
              options={BUDGET_RANGES}
              placeholder="Select range"
              value={values.budget_range}
              onChange={setField("budget_range")}
              errors={fieldErrors.budget_range}
            />
            <Select
              label="Best Time to Call"
              name="preferred_contact_time"
              options={CONTACT_TIMES}
              placeholder="Select time"
              value={values.preferred_contact_time}
              onChange={setField("preferred_contact_time")}
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
              value={values.message}
              onChange={(e) => setField("message")(e.target.value)}
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
