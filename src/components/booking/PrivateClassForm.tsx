"use client";

/**
 * Private class enquiry -- a separate flow from the schedule booking, because
 * a private session has no fixed slot, no quota and no recurring pattern.
 *
 * Same discipline as the main form: validated in the browser for speed, then
 * re-validated on the server before anything is accepted.
 */

import { useState } from "react";
import Listbox from "@/components/Listbox";
import { buildWhatsAppMessage } from "@/components/WhatsAppLink";
import { submitPrivateEnquiry } from "@/app/actions";
import { STUDIO_NAME, WHATSAPP_NUMBER, isPending } from "@/lib/config";
import type { FieldErrors } from "@/lib/validation";
import { hasErrors, validateName, validateNotes, validateWhatsApp } from "@/lib/validation";

const TIME_OPTIONS = [
  { value: "pagi", label: "Pagi (06:00 - 10:00)" },
  { value: "siang", label: "Siang (10:00 - 15:00)" },
  { value: "sore", label: "Sore (15:00 - 18:00)" },
  { value: "malam", label: "Malam (18:00 - 21:00)" },
  { value: "fleksibel", label: "Fleksibel" },
];

const FOCUS_OPTIONS = [
  { value: "belum-tahu", label: "Belum tahu, ingin didiskusikan" },
  { value: "dasar", label: "Pengenalan pose dasar" },
  { value: "tempo-pelan", label: "Kelas bertempo pelan" },
  { value: "tempo-aktif", label: "Kelas bertempo aktif" },
  { value: "prenatal", label: "Prenatal" },
  { value: "kelompok", label: "Kelompok kecil tertutup" },
];

const PEOPLE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} orang`,
}));

export default function PrivateClassForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [people, setPeople] = useState("1");
  const [time, setTime] = useState("fleksibel");
  const [focus, setFocus] = useState("belum-tahu");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null | "no-number">(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    const n = validateName(name);
    if (n) next.name = n;
    const w = validateWhatsApp(whatsapp);
    if (w) next.whatsapp = w;
    const nt = validateNotes(notes);
    if (nt) next.notes = nt;
    setErrors(next);
    if (hasErrors(next)) return;

    setBusy(true);
    try {
      const result = await submitPrivateEnquiry({
        name,
        whatsapp,
        people: Number(people),
        preferredTime: time,
        focus,
        notes,
        company,
      });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      const lines = [
        `Nama: ${name.trim()}`,
        `Nomor WhatsApp: ${whatsapp.trim()}`,
        "",
        "Permintaan: Kelas privat",
        `Jumlah peserta: ${people} orang`,
        `Perkiraan waktu: ${TIME_OPTIONS.find((t) => t.value === time)?.label ?? time}`,
        `Fokus materi: ${FOCUS_OPTIONS.find((f) => f.value === focus)?.label ?? focus}`,
        `Catatan: ${notes.trim() || "-"}`,
      ];

      if (isPending(WHATSAPP_NUMBER)) {
        setSent("no-number");
        return;
      }

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        buildWhatsAppMessage({
          intro: `Halo ${STUDIO_NAME}, saya ingin mengajukan kelas privat.`,
          lines,
          label: "Ajukan Kelas Privat",
          sourceUrl: window.location.href,
        })
      )}`;
      setSent(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setErrors({ form: "Permintaan gagal dikirim. Coba lagi sebentar lagi." });
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="card flex flex-col gap-4 p-5">
        <p className="text-sm font-medium text-[var(--color-accent)]">
          Permintaan tercatat
        </p>
        {sent === "no-number" ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Nomor WhatsApp studio belum diisi di konfigurasi situs, jadi pesan
            belum bisa dikirim otomatis.
          </p>
        ) : (
          <>
            <p className="text-sm text-[var(--color-ink-soft)]">
              WhatsApp sudah dibuka di tab baru. Kalau tidak terbuka, gunakan
              tombol di bawah.
            </p>
            <a
              href={sent}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Buka WhatsApp
            </a>
          </>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSent(null)}
        >
          Ajukan Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card flex flex-col gap-4 p-5">
      <div>
        <label className="field-label" htmlFor="pv-name">
          Nama
        </label>
        <input
          id="pv-name"
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "pv-name-err" : undefined}
          required
        />
        {errors.name ? (
          <p id="pv-name-err" className="field-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="pv-wa">
          Nomor WhatsApp
        </label>
        <input
          id="pv-wa"
          className="field-input"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="08xxxxxxxxxx"
          aria-invalid={errors.whatsapp ? "true" : undefined}
          aria-describedby={errors.whatsapp ? "pv-wa-err" : undefined}
          required
        />
        {errors.whatsapp ? (
          <p id="pv-wa-err" className="field-error">
            {errors.whatsapp}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Listbox
            label="Jumlah peserta"
            value={people}
            onChange={setPeople}
            options={PEOPLE_OPTIONS}
            invalid={Boolean(errors.seats)}
          />
          {errors.seats ? <p className="field-error">{errors.seats}</p> : null}
        </div>
        <Listbox
          label="Perkiraan waktu"
          value={time}
          onChange={setTime}
          options={TIME_OPTIONS}
        />
      </div>

      <Listbox
        label="Fokus materi"
        value={focus}
        onChange={setFocus}
        options={FOCUS_OPTIONS}
      />

      <div>
        <label className="field-label" htmlFor="pv-notes">
          Catatan{" "}
          <span className="font-normal text-[var(--color-ink-soft)]">
            (opsional)
          </span>
        </label>
        <textarea
          id="pv-notes"
          className="field-input min-h-24 resize-y"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          aria-invalid={errors.notes ? "true" : undefined}
        />
        {errors.notes ? <p className="field-error">{errors.notes}</p> : null}
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="pv-company">Perusahaan</label>
        <input
          id="pv-company"
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
        Jadwal, durasi dan ketentuan kelas privat dibicarakan lewat WhatsApp.
      </p>

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Mengirim..." : "Ajukan Kelas Privat"}
      </button>
    </form>
  );
}
