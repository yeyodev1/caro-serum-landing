<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import AnnouncementBar from '@/components/layout/AnnouncementBar.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import BenefitsMarquee from '@/components/sections/BenefitsMarquee.vue'
import TrustBar from '@/components/sections/TrustBar.vue'
import ResultsSection from '@/components/sections/ResultsSection.vue'
import QuoteBanner from '@/components/sections/QuoteBanner.vue'
import ComparisonSection from '@/components/sections/ComparisonSection.vue'
import CombosSection from '@/components/sections/CombosSection.vue'
import HowToSection from '@/components/sections/HowToSection.vue'
import ConstancySection from '@/components/sections/ConstancySection.vue'
import CommunitySection from '@/components/sections/CommunitySection.vue'
import MaskUpsell from '@/components/sections/MaskUpsell.vue'
import FaqSection from '@/components/sections/FaqSection.vue'
import FinalDecision from '@/components/sections/FinalDecision.vue'
import FooterCta from '@/components/sections/FooterCta.vue'
import ToastNotice from '@/components/ui/ToastNotice.vue'
import CartDrawer from '@/components/checkout/CartDrawer.vue'
import CheckoutWizard from '@/components/checkout/CheckoutWizard.vue'
import PayphoneGateway from '@/components/checkout/PayphoneGateway.vue'
import LocationPicker from '@/components/checkout/LocationPicker.vue'
import TransferConfirmModal from '@/components/checkout/TransferConfirmModal.vue'
import TransferReceiptModal from '@/components/checkout/TransferReceiptModal.vue'
import InvoiceOnboardingModal from '@/components/checkout/InvoiceOnboardingModal.vue'
import InvoiceChoiceModal from '@/components/checkout/InvoiceChoiceModal.vue'
import { useToast } from '@/composables/useToast'
import { useOrderSubmission } from '@/composables/useOrderSubmission'
import { isTransferConfirmationOpen, isTransferReceiptOpen, useCheckout } from '@/composables/useCheckout'

const { closeOverlays } = useCheckout()
const { confirmPayPhoneReturn } = useOrderSubmission()
const { clearToastTimer } = useToast()

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (isTransferConfirmationOpen.value) isTransferConfirmationOpen.value = false
  else if (isTransferReceiptOpen.value) isTransferReceiptOpen.value = false
  else closeOverlays()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  void confirmPayPhoneReturn()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearToastTimer()
})
</script>

<template>
  <main class="home-view">
    <AnnouncementBar />
    <SiteHeader />

    <HeroSection />
    <BenefitsMarquee />
    <TrustBar />
    <ResultsSection />
    <QuoteBanner />
    <ComparisonSection />
    <CombosSection />
    <HowToSection />
    <ConstancySection />
    <CommunitySection />
    <MaskUpsell />
    <FaqSection />
    <FinalDecision />
    <FooterCta />
    <SiteFooter />

    <ToastNotice />
    <CartDrawer />
    <CheckoutWizard />
    <PayphoneGateway />
    <LocationPicker />
    <TransferConfirmModal />
    <TransferReceiptModal />
    <InvoiceOnboardingModal />
    <InvoiceChoiceModal />
  </main>
</template>

<style lang="scss">
@use '@/styles/landing/index.scss';
</style>
