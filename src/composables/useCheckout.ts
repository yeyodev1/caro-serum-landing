import { computed, nextTick, ref, watch } from 'vue'
import { ecuadorCantonsByProvince } from '@/config/ecuadorCantons'
import { citiesByProvince, provinces } from '@/config/ecuador-locations'
import { useCart } from '@/composables/useCart'
import type { PaymentMethod, PaymentStatus, SelectedReceipt, TransferSuccess } from '@/types/landing'

export const isCheckoutWizardOpen = ref(false)
export const isPayphoneGatewayOpen = ref(false)
export const checkoutStep = ref<1 | 2 | 3>(1)
export const checkoutError = ref('')
export const isSubmitting = ref(false)
export const paymentMethod = ref<PaymentMethod>('payphone')

export const buyer = ref({ firstName: '', lastName: '', email: '', phone: '' })
export const delivery = ref({ country: 'Ecuador', province: '', city: '', address: '', reference: '' })
export const invoice = ref({ identification: '', firstName: '', lastName: '', email: '', address: '' })

export const isInvoiceOpen = ref(false)
export const isInvoiceChoiceOpen = ref(false)
export const invoiceCompleted = ref(false)
export const wantsInvoice = ref<boolean | null>(null)

export const isTransferConfirmationOpen = ref(false)
export const isTransferReceiptOpen = ref(false)
export const transferSuccess = ref<TransferSuccess | null>(null)
export const selectedTransferReceipt = ref<SelectedReceipt | null>(null)
export const hasConfirmedTransferAmount = ref(false)
export const isUploadingReceipt = ref(false)
export const paymentStatus = ref<PaymentStatus | null>(null)

export const isLocationPickerOpen = ref(false)
export const locationPickerTarget = ref<'province' | 'city'>('province')
export const locationSearch = ref('')
const cities = ref<string[]>([])

watch(() => delivery.value.province, (province) => {
  cities.value = ecuadorCantonsByProvince[province] || citiesByProvince[province] || []
  delivery.value.city = ''
})

export function useCheckout() {
  const { isCartOpen, requiresInvoice } = useCart()

  const shouldCollectInvoice = computed(() => requiresInvoice.value || wantsInvoice.value === true)

  const locationOptions = computed(() => {
    const options = locationPickerTarget.value === 'province' ? provinces : cities.value
    const query = locationSearch.value.trim().toLocaleLowerCase('es-EC')
    return query ? options.filter((option) => option.toLocaleLowerCase('es-EC').includes(query)) : options
  })

  const normalizedWhatsApp = computed(() => {
    const digits = buyer.value.phone.replace(/\D/g, '')
    const local = /^09\d{8}$/.test(digits) ? digits.slice(1) : digits.replace(/^593/, '')
    if (/^9\d{8}$/.test(local)) return `+593 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`
    return /^[1-9]\d{6,14}$/.test(digits) ? `+${digits}` : ''
  })

  function openCheckout() {
    isCartOpen.value = false
    isCheckoutWizardOpen.value = true
    checkoutStep.value = 1
    checkoutError.value = ''
    transferSuccess.value = null
    selectedTransferReceipt.value = null
    hasConfirmedTransferAmount.value = false
    invoiceCompleted.value = false
    wantsInvoice.value = null
  }

  function closeOverlays() {
    isCartOpen.value = false
    isCheckoutWizardOpen.value = false
    isPayphoneGatewayOpen.value = false
    isTransferConfirmationOpen.value = false
    isTransferReceiptOpen.value = false
    paymentStatus.value = null
  }

  function openInvoiceOnboarding() {
    if (!shouldCollectInvoice.value || invoiceCompleted.value) return
    invoice.value.firstName ||= buyer.value.firstName
    invoice.value.lastName ||= buyer.value.lastName
    invoice.value.email ||= buyer.value.email
    invoice.value.address ||= delivery.value.address
    isInvoiceOpen.value = true
  }

  function completeInvoiceOnboarding() { invoiceCompleted.value = true; isInvoiceOpen.value = false }

  function chooseInvoice(value: boolean) {
    wantsInvoice.value = value
    isInvoiceChoiceOpen.value = false
    if (value) openInvoiceOnboarding()
  }

  function openLocationPicker(target: 'province' | 'city' = delivery.value.province ? 'city' : 'province') {
    locationPickerTarget.value = target
    locationSearch.value = ''
    isLocationPickerOpen.value = true
  }

  function chooseLocation(option: string) {
    if (locationPickerTarget.value === 'province') {
      delivery.value.province = option
      delivery.value.city = ''
      locationPickerTarget.value = 'city'
      locationSearch.value = ''
      return
    }
    delivery.value.city = option
    isLocationPickerOpen.value = false
  }

  // El paso 3 decide si hay que pedir datos de facturación antes de pagar.
  function onEnterPaymentStep() {
    void nextTick().then(() => {
      if (requiresInvoice.value) openInvoiceOnboarding()
      else if (wantsInvoice.value === null) isInvoiceChoiceOpen.value = true
      else openInvoiceOnboarding()
    })
  }

  return {
    shouldCollectInvoice, locationOptions, normalizedWhatsApp,
    openCheckout, closeOverlays, openInvoiceOnboarding, completeInvoiceOnboarding,
    chooseInvoice, openLocationPicker, chooseLocation, onEnterPaymentStep,
  }
}
