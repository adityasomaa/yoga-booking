"use client";

import Modal from "@/components/Modal";
import BookingForm from "./BookingForm";
import { formatDateLong } from "@/lib/schedule";
import type { ResolvedSession } from "@/lib/store/hooks";

export default function BookingModal({
  session,
  open,
  onClose,
}: {
  session: ResolvedSession | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!session) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Pesan Kelas"
      description={`${session.className}, ${formatDateLong(session.dateISO)}, pukul ${session.startTime}`}
    >
      <BookingForm session={session} onDone={onClose} />
    </Modal>
  );
}
