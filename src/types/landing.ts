export type Product = { id: string; name: string; detail: string; price: number; size: string; image: string }
export type CartItem = { productId: string; name: string; price: number; qty: number }
export type PaymentMethod = 'payphone' | 'transfer'

export type OrderResponse = {
  order?: { status?: string; reference?: string; clientTransactionId?: string; hasTransferReceipt?: boolean }
  reference?: string
  instructions?: string | string[]
  transfer?: { status?: string; instructions?: string }
  payphone?: {
    token?: string; storeId?: string; clientTransactionId?: string
    amount?: number; amountWithoutTax?: number; currency?: string; reference?: string
  }
  token?: string
  storeId?: string
  clientTransactionId?: string
}

export type TransferSuccess = { reference: string; instructions: string[]; totalCents: number }
export type PaymentStatus = { title: string; message: string; paid: boolean }
export type SelectedReceipt = { name: string; dataUrl: string }

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (elementId: string) => void }
  }
}
