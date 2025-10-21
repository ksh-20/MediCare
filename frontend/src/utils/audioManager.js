import { Howl } from 'howler'

class AudioManager {
  constructor() {
    this.sounds = new Map()
    this.currentAlarm = null
    this.isPlaying = false
  }

  preloadSound(name, src) {
    const sound = new Howl({
      src: [src],
      volume: 0.7,
      loop: false,
      onload: () => {
        console.log(`Sound ${name} loaded successfully`)
      },
      onloaderror: (id, error) => {
        console.error(`Failed to load sound ${name}:`, error)
      }
    })
    
    this.sounds.set(name, sound)
    return sound
  }

  playSound(name, options = {}) {
    const sound = this.sounds.get(name)
    if (!sound) {
      console.error(`Sound ${name} not found`)
      return null
    }

    const soundId = sound.play()
    
    if (options.volume !== undefined) {
      sound.volume(options.volume, soundId)
    }
    
    if (options.loop) {
      sound.loop(true, soundId)
    }

    return soundId
  }

  stopSound(name, soundId = null) {
    const sound = this.sounds.get(name)
    if (!sound) return

    if (soundId) {
      sound.stop(soundId)
    } else {
      sound.stop()
    }
  }

  playAlarm(audioFile = '/audio/alarm.mp3', options = {}) {
    // Stop current alarm if playing
    this.stopAlarm()

    const alarm = new Howl({
      src: [audioFile],
      volume: options.volume || 0.7,
      loop: true,
      onplay: () => {
        this.isPlaying = true
        this.currentAlarm = alarm
      },
      onstop: () => {
        this.isPlaying = false
        this.currentAlarm = null
      },
      onend: () => {
        this.isPlaying = false
        this.currentAlarm = null
      }
    })

    alarm.play()
    return alarm
  }

  stopAlarm() {
    if (this.currentAlarm) {
      this.currentAlarm.stop()
      this.currentAlarm = null
      this.isPlaying = false
    }
  }

  pauseAlarm() {
    if (this.currentAlarm) {
      this.currentAlarm.pause()
      this.isPlaying = false
    }
  }

  resumeAlarm() {
    if (this.currentAlarm) {
      this.currentAlarm.play()
      this.isPlaying = true
    }
  }

  setAlarmVolume(volume) {
    if (this.currentAlarm) {
      this.currentAlarm.volume(Math.max(0, Math.min(1, volume)))
    }
  }

  isAlarmPlaying() {
    return this.isPlaying
  }

  // Preload common sounds
  preloadCommonSounds() {
    this.preloadSound('notification', '/audio/notification.mp3')
    this.preloadSound('success', '/audio/success.mp3')
    this.preloadSound('error', '/audio/error.mp3')
    this.preloadSound('alarm', '/audio/alarm.mp3')
  }

  // Clean up resources
  destroy() {
    this.stopAlarm()
    this.sounds.forEach(sound => {
      sound.unload()
    })
    this.sounds.clear()
  }
}

// Create singleton instance
const audioManager = new AudioManager()

export default audioManager
