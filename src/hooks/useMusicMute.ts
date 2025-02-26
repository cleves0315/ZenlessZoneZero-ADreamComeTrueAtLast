import { ref } from "vue"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

export const useMusicMute = () => {
  const isBgmMute = ref(getStorage(StorageKey.MUSIC_MUTED) ?? false)

  const toggleBgmMute = () => {
    isBgmMute.value = !isBgmMute.value
    setStorage(StorageKey.MUSIC_MUTED, isBgmMute.value)
  }

  const getBgmMuted = () => {
    return getStorage(StorageKey.MUSIC_MUTED) ?? false
  }

  return {
    isBgmMute,
    toggleBgmMute,
    getBgmMuted,
  }
}
