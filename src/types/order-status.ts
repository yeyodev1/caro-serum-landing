export type Order = { reference: string; buyerEmail?: string; invoice?: { requested: boolean; email?: string }; paymentMethod: 'payphone' | 'transfer'; status: 'awaiting_transfer' | 'pending_payphone' | 'paid' | 'cancelled'; shippingCents: number; totalCents: number; createdAt: string; hasTransferReceipt: boolean; items: { name: string; quantity: number; lineTotalCents: number }[] }
export type Payphone = { token: string; storeId: string; clientTransactionId: string; amount: number; amountWithoutTax: number; currency: string; reference: string }

declare global { interface Window { PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (id: string) => void } } }
