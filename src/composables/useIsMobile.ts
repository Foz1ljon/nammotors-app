import { onMounted, onUnmounted, ref } from 'vue'

export function useIsMobile(breakpoint = 992) {
  const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < breakpoint : false)

  function update() {
    isMobile.value = window.innerWidth < breakpoint
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))

  return isMobile
}
