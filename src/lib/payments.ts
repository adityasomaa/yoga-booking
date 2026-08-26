/**
 * =============================================================================
 *  PAYMENT ADAPTER  --  EMPTY ON PURPOSE
 * =============================================================================
 *
 *  There is no payment gateway on this site. Payment is arranged over
 *  WhatsApp. That is a deliberate choice, not an omission.
 *
 *  This layer exists so that adding a gateway later (Midtrans, Xendit, Stripe,
 *  QRIS, bank transfer confirmation, anything) does not require touching the
 *  booking flow. The flow already calls `settleBooking()` at exactly the point
 *  where a payment step would belong.
 *
 *  TO ADD A GATEWAY
 *  ----------------
 *  1. Implement a PaymentAdapter (see the interface below).
 *  2. Export it as `paymentAdapter` instead of `whatsappHandoffAdapter`.
 *  3. Booking submission will then await a real payment result before the
 *     record is written, with no other change anywhere in the app.
 * =============================================================================
 */

export type PaymentIntent = {
  bookingId: string;
  sessionId: string;
  className: string;
  dateISO: string;
  startTime: string;
  seats: number;
  customerName: string;
  customerWhatsApp: string;
};

export type PaymentResult =
  | { kind: "not-required"; note: string }
  | { kind: "redirect"; url: string }
  | { kind: "settled"; reference: string }
  | { kind: "failed"; reason: string };

export interface PaymentAdapter {
  readonly id: string;
  /** Whether the booking flow should render any payment UI at all. */
  readonly collectsPayment: boolean;
  settleBooking(intent: PaymentIntent): Promise<PaymentResult>;
}

/**
 * The adapter that is actually in use: it collects nothing and simply reports
 * that payment happens in the WhatsApp conversation.
 */
export const whatsappHandoffAdapter: PaymentAdapter = {
  id: "whatsapp-handoff",
  collectsPayment: false,
  async settleBooking(intent: PaymentIntent): Promise<PaymentResult> {
    void intent;
    return {
      kind: "not-required",
      note: "Pembayaran diatur lewat percakapan WhatsApp.",
    };
  },
};

export const paymentAdapter: PaymentAdapter = whatsappHandoffAdapter;
