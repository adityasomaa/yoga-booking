"use client";

/**
 * =============================================================================
 *  BOOKING FORM
 * =============================================================================
 *
 *  When opened from the schedule, the class, date and time arrive already
 *  filled in and are shown as read-only facts rather than editable fields --
 *  there is nothing for the visitor to get wrong.
 *
 *  Validation runs twice. The browser copy gives instant feedback. The server
 *  action then re-checks EVERYTHING from scratch, rebuilding the session from
 *  the recurrence patterns instead of trusting the submitted date and time,
 *  and re-applying the quota and lead-time rules against a server clock.
 *
 *  On success the seat count drops immediately in the store -- every schedule
 *  view re-renders through useSyncExternalStore, so remaining places update
 *  without a page refresh -- and WhatsApp opens with the whole enquiry laid
 *  out one field per line, including the page it was sent from.
 * =============================================================================
 */

import { useEffect, useMemo, useState } from "react";
import Listbox from "@/components/Listbox";
import { buildWhatsAppMessage } from "@/components/WhatsAppLink";
import { submitBooking } from "@/app/actions";
import {
  MAX_SEATS_PER_BOOKING,
  STUDIO_NAME,
  WHATSAPP_NUMBER,
  isPending,
} from "@/lib/config";
import { formatDateLong } from "@/lib/schedule";
import type { ResolvedSession } from "@/lib/store/hooks";
import { useStoreActions, useStoreSnapshot } from "@/lib/store/hooks";
import {
  EXPERIENCE_OPTIONS,
  hasErrors,
  validateName,
  validateNotes,
  validateWhatsApp,
  type FieldErrors,
} from "@/lib/validation";
import {
  readRememberedDetails,
  rememberDetails,
  useConsent,
} from "@/lib/consent";
import type { ExperienceLevel } from "@/lib/store/types";

export default function BookingForm({
  session,
  onDone,
}: {
  session: ResolvedSession;
  onDone: () => void;
}) {
  const actions = useStoreActions();
  const snapshot = useStoreSnapshot();
  const consent = useConsent();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [seats, setSeats] = useState("1");
  const [experience, setExperience] = useState<ExperienceLevel>("baru");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [done, setDone] = useState<null | { waUrl: string | null }>(null);

  // Prefill from remembered details, but only if the visitor allowed it.
  useEffect(() => {
    if (!consent.preferences) return;
    const remembered = readRememberedDetails();
    if (remembered) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setName((n) => n || remembered.name);
      setWhatsapp((w) => w || remembered.whatsapp);
    }
  }, [consent.preferences]);

  const seatsLeft = session.status.seatsLeft;

  const seatOptions = useMemo(() => {
    const max = Math.min(MAX_SEATS_PER_BOOKING, Math.max(1, seatsLeft));
    return Array.from({ length: max }, (_, i) => ({
      value: String(i + 1),
      label: i === 0 ? "1 orang" : `${i + 1} orang`,
    }));
  }, [seatsLeft]);

  // If seats drop below the chosen amount while the form is open, pull it back.
  useEffect(() => {
    if (Number(seats) > Math.max(1, seatsLeft)) {
      // Someone else took seats while this form was open; pull the
      // selection back to what is actually available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeats(String(Math.max(1, seatsLeft)));
    }
  }, [seatsLeft, seats]);

  const validateClient = (): FieldErrors => {
    const next: FieldErrors = {};
    const n = validateName(name);
    if (n) next.name = n;
    const w = validateWhatsApp(whatsapp);
    if (w) next.whatsapp = w;
    const nt = validateNotes(notes);
    if (nt) next.notes = nt;
    const s = Number(seats);
    if (!Number.isInteger(s) || s < 1) next.seats = "Jumlah orang minimal 1.";
    else if (s > seatsLeft) {
      next.seats =
        seatsLeft === 1
          ? "Tersisa 1 tempat untuk sesi ini."
          : `Tersisa ${seatsLeft} tempat untuk sesi ini.`;
    }
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateClient();
    setErrors(clientErrors);
    if (hasErrors(clientErrors)) return;

    setPendingSubmit(true);
    try {
      // The server re-derives the session and re-checks quota + lead time.
      const result = await submitBooking({
        name,
        whatsapp,
        sessionId: session.id,
        seats: Number(seats),
        experience,
        notes,
        company,
        takenSeats: session.bookedSeats,
        capacityOverride: snapshot.admin.capacityOverrides[session.id],
        extraExceptions: snapshot.admin.exceptions,
      });

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      const b = result.booking;

      // Seats decrease here; every schedule view updates with no refresh.
      actions.addBooking({
        sessionId: b.sessionId,
        patternId: b.patternId,
        dateISO: b.dateISO,
        startTime: b.startTime,
        classSlug: b.classSlug,
        className: b.className,
        name: b.name,
        whatsapp: b.whatsapp,
        seats: b.seats,
        experience: b.experience as ExperienceLevel,
        notes: b.notes,
      });

      if (consent.preferences) {
        rememberDetails({ name: b.name, whatsapp: b.whatsapp });
      }

      const experienceLabel =
        EXPERIENCE_OPTIONS.find((o) => o.value === b.experience)?.label ?? b.experience;

      const lines = [
        `Nama: ${b.name}`,
        `Nomor WhatsApp: ${b.whatsapp}`,
        "",
        `Kelas: ${b.className}`,
        `Tanggal: ${formatDateLong(b.dateISO)}`,
        `Jam: ${b.startTime} - ${b.endTime}`,
        ...(b.room ? [`Ruang: ${b.room}`] : []),
        `Jumlah orang: ${b.seats}`,
        `Pengalaman: ${experienceLabel}`,
        `Catatan: ${b.notes || "-"}`,
      ];

      const waUrl = isPending(WHATSAPP_NUMBER)
        ? null
        : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            buildWhatsAppMessage({
              intro: `Halo ${STUDIO_NAME}, saya ingin memesan kelas.`,
              lines,
              label: "Kirim Pemesanan",
              sourceUrl: window.location.href,
            })
          )}`;

      setDone({ waUrl });
      if (waUrl) window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrors({
        form: "Pemesanan gagal dikirim. Coba lagi sebentar lagi.",
      });
    } finally {
      setPendingSubmit(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-accent-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-accent)]">
            Pemesanan tercatat
          </p>
          <p className="mt-1.5 text-sm text-[var(--color-ink)]">
            Sisa tempat untuk sesi ini sudah berkurang. Pemesanan belum final
            sampai dikonfirmasi studio lewat WhatsApp.
          </p>
        </div>

        {done.waUrl ? (
          <>
            <p className="text-sm text-[var(--color-ink-soft)]">
              WhatsApp sudah dibuka di tab baru dengan pesan yang sudah terisi.
              Kalau tidak terbuka, gunakan tombol di bawah.
            </p>
            <a
              href={done.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Buka WhatsApp
            </a>
          </>
        ) : (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
            Nomor WhatsApp studio belum diisi di konfigurasi situs, jadi pesan
            belum bisa dikirim otomatis.
          </p>
        )}

        <button type="button" className="btn btn-secondary" onClick={onDone}>
          Tutup
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Prefilled session facts -- read-only on purpose. */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-4">
        <p className="t-eyebrow">Sesi yang dipilih</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-[var(--color-ink-soft)]">Kelas</dt>
          <dd className="font-medium">{session.className}</dd>
          <dt className="text-[var(--color-ink-soft)]">Tanggal</dt>
          <dd>{formatDateLong(session.dateISO)}</dd>
          <dt className="text-[var(--color-ink-soft)]">Jam</dt>
          <dd>
            {session.startTime} &ndash; {session.endTime}
          </dd>
          {session.room ? (
            <>
              <dt className="text-[var(--color-ink-soft)]">Ruang</dt>
              <dd>{session.room}</dd>
            </>
          ) : null}
          <dt className="text-[var(--color-ink-soft)]">Sisa tempat</dt>
          <dd>{seatsLeft}</dd>
        </dl>
      </div>

      <div>
        <label className="field-label" htmlFor="bk-name">
          Nama
        </label>
        <input
          id="bk-name"
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "bk-name-err" : undefined}
          required
        />
        {errors.name ? (
          <p id="bk-name-err" className="field-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="bk-wa">
          Nomor WhatsApp
        </label>
        <input
          id="bk-wa"
          className="field-input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="08xxxxxxxxxx"
          aria-invalid={errors.whatsapp ? "true" : undefined}
          aria-describedby={errors.whatsapp ? "bk-wa-err" : "bk-wa-hint"}
          required
        />
        {errors.whatsapp ? (
          <p id="bk-wa-err" className="field-error">
            {errors.whatsapp}
          </p>
        ) : (
          <p id="bk-wa-hint" className="field-hint">
            Dipakai studio untuk mengonfirmasi pemesanan.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Listbox
            label="Jumlah orang"
            value={seats}
            onChange={setSeats}
            options={seatOptions}
            invalid={Boolean(errors.seats)}
            describedBy={errors.seats ? "bk-seats-err" : undefined}
          />
          {errors.seats ? (
            <p id="bk-seats-err" className="field-error">
              {errors.seats}
            </p>
          ) : null}
        </div>

        <Listbox<ExperienceLevel>
          label="Tingkat pengalaman"
          value={experience}
          onChange={setExperience}
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="bk-notes">
          Catatan <span className="font-normal text-[var(--color-ink-soft)]">(opsional)</span>
        </label>
        <textarea
          id="bk-notes"
          className="field-input min-h-24 resize-y"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          aria-invalid={errors.notes ? "true" : undefined}
          aria-describedby={errors.notes ? "bk-notes-err" : undefined}
        />
        {errors.notes ? (
          <p id="bk-notes-err" className="field-error">
            {errors.notes}
          </p>
        ) : null}
      </div>

      {/* Honeypot. Hidden with clip, not a negative absolute offset, so it can
          never create a horizontal scrollbar. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="bk-company">Perusahaan</label>
        <input
          id="bk-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {errors.form ? (
        <p role="alert" className="field-error">
          {errors.form}
        </p>
      ) : null}

      <p className="text-xs text-[var(--color-ink-soft)]">
        Pemesanan dikonfirmasi lewat WhatsApp. Tidak ada pembayaran di situs ini.
      </p>

      <button type="submit" className="btn btn-primary" disabled={pendingSubmit}>
        {pendingSubmit ? "Mengirim..." : "Kirim Pemesanan"}
      </button>
    </form>
  );
}
