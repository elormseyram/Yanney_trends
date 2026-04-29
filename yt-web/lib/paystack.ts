/** Paystack — wire to env and server routes (see master prompt). */

export interface PaystackInit {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  /** e.g. ["mobile_money", "card"] — biases the hosted page tabs in Ghana. */
  channels?: string[];
}

export async function initializePaystackPayment(input: PaystackInit) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return { status: false, message: "Paystack not configured" };
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url?: string; access_code?: string; reference?: string };
  };
  return json;
}

export async function verifyPaystackPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !reference) {
    return { success: false, amount: 0, reference: "", status: "failed" };
  }
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const json = (await res.json()) as {
    status: boolean;
    data?: {
      amount?: number;
      reference?: string;
      status?: string;
    };
  };
  const amount = Number(json.data?.amount ?? 0);
  const status = String(json.data?.status ?? "");
  return {
    success: Boolean(json.status && status === "success"),
    amount,
    reference: String(json.data?.reference ?? reference),
    status,
  };
}
