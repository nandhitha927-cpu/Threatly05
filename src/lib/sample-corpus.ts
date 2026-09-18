import { analyzeText, type AnalysisResult } from "./analyzer";

/**
 * Deterministic pseudo-random generator (mulberry32) so the demo corpus is
 * reproducible across renders — same seed, same trend chart.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Template = (rand: () => number, n: number) => string;

/**
 * Message templates across the eleven spec categories. Each template embeds
 * cue phrases so the rule engine classifies them into the intended issue label.
 */
const TEMPLATES: Template[] = [
  // Login Failure — the top reported issue in the spec's example table
  (rand, n) =>
    pick(rand, [
      `I cannot log in to my account. Order reference #${n}. It says my password is wrong even though I reset it yesterday.`,
      `Account login problem: I'm locked out after too many attempts. My order #${n} is stuck because of this.`,
      `Can't sign in since this morning — the login page rejects my credentials. Ticket ${n}.`,
    ]),
  // Payment Failure
  (_rand, n) =>
    pick2(_rand, [
      `My payment failed for order #${n} but the money was deducted from my card. Transaction shows pending.`,
      `Card declined while paying for order #${n}, though the card is valid and not expired.`,
      `Payment for order #${n} did not go through — your checkout shows transaction failed.`,
    ]),
  // Delivery Delay
  (rand, n) =>
    pick(rand, [
      `My order #${n} is delayed — it was supposed to arrive on Monday and the tracking hasn't updated for days.`,
      `Delivery of my package ${n} is delayed again. The parcel shows out for delivery but never comes.`,
      `Shipping delay on order #${n}; it has been in transit for two weeks with no tracking updates.`,
    ]),
  // Password Reset
  (_rand, n) =>
    pick2(_rand, [
      `I forgot my password for account ${n}. The reset email never arrives.`,
      `Password reset link for user ${n} expired after one minute. Please send a new one.`,
      `I requested a password reset hours ago and haven't received the email yet.`,
    ]),
  // Refund Delay
  (rand, n) =>
    pick(rand, [
      `My refund for order #${n} was approved three weeks ago and still hasn't arrived. This is unacceptable.`,
      `The refund of $${n % 90 + 10}.99 for the returned item is still pending — promised three weeks ago. Very frustrated.`,
      `Where is my money back for cancelled order ${n}? The refund has been pending for a month.`,
    ]),
  // Duplicate Payment → Billing Problem
  (_rand, n) =>
    pick2(_rand, [
      `I was charged twice for my subscription this month. Order #${n}. Please refund the extra payment.`,
      `Duplicate charge of $${
        (n % 90) + 10
      }.99 appeared on my card for a single purchase. I want my money back.`,
      `Billed two times for one transaction, invoice ${n}. This is the second month in a row.`,
    ]),
  // Product Defect
  (rand, n) =>
    pick(rand, [
      `The headphones I received (order #${n}) are broken — the left side doesn't work at all.`,
      `Product defect: the unit stopped working after two uses. Damaged goods for order ${n}.`,
      `Item ${n} arrived defective and doesn't turn on. Clearly faulty hardware.`,
    ]),
  // Order Not Received
  (_rand, n) =>
    pick2(_rand, [
      `My order #${n} never arrived even though the tracking says delivered. This is the third time.`,
      `Package ${n} has not been delivered — it's been 12 days and counting.`,
      `Order ${n} was marked delivered but nothing has come. I have contacted you multiple times.`,
    ]),
  // Service Outage
  (rand, n) =>
    pick(rand, [
      `Your app is down again for me — error code 500 every time I try to check order #${n}.`,
      `The website is crashing on checkout for cart ${n}. Server error all morning.`,
      `API timeouts keep breaking the dashboard; order sync for ${n} fails.`,
    ]),
  // Account Locked
  (_rand, n) =>
    pick2(_rand, [
      `My account ${n} was suspended without explanation. I need it restored today.`,
      `Account locked after a password change; I cannot log in at all now.`,
      `You disabled my account ${n} by mistake — please unlock it, this is urgent.`,
    ]),
  // Unauthorized Charge
  (rand, n) =>
    pick(rand, [
      `There is an unauthorized charge of $${
        (n % 200) + 20
      }.99 on my card from your store. I never placed order #${n}.`,
      `Fraudulent transaction on my statement for order ${n} — I did not authorize this payment.`,
      `Someone used my card details; order ${n} is not mine. This is fraud.`,
    ]),
  // General / Other (keeps the corpus realistic, not 100% classifiable)
  (_rand, n) =>
    pick2(_rand, [
      `Quick question about invoice ${n}: does the yearly plan include the new features?`,
      `Do you ship to my country for order ${n}? Thanks.`,
      `How do I change the shipping address for order ${n}?`,
    ]),
];

function pick(rand: () => number, arr: string[]): string {
  return arr[Math.floor(rand() * arr.length)];
}

function pick2(rand: () => number, arr: string[]): string {
  return arr[Math.floor(rand() * arr.length)];
}

/** Issue labels the corpus intentionally targets, in rough market frequency order. */
const TEMPLATE_WEIGHTS = [14, 12, 11, 9, 8, 7, 7, 6, 5, 4, 3, 14];

/**
 * Generate a deterministic demo corpus of customer messages and analyze each.
 * The heavy template weights mirror the spec's example distribution where
 * Login Failure, Payment Failure and Delivery Delay dominate.
 */
export function generateSampleCorpus(size: number, seed = 42): AnalysisResult[] {
  const rand = mulberry32(seed);
  const totalWeight = TEMPLATE_WEIGHTS.reduce((a, b) => a + b, 0);
  const results: AnalysisResult[] = [];
  for (let i = 0; i < size; i++) {
    let roll = rand() * totalWeight;
    let t = 0;
    while (roll > TEMPLATE_WEIGHTS[t]) {
      roll -= TEMPLATE_WEIGHTS[t];
      t++;
    }
    const text = TEMPLATES[t](rand, 1000 + i);
    results.push(analyzeText(text));
  }
  return results;
}
