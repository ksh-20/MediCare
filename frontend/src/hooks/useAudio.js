import { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [currentSound, setCurrentSound] = useState(null)
  const soundRef = useRef(null)

  const playAlarm = (audioFile = '/audio/alarm.mp3') => {
    if (soundRef.current) {
      soundRef.current.stop()
    }

    const sound = new Howl({
      src: [audioFile],
      volume: volume,
      loop: true,
      onplay: () => setIsPlaying(true),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false)
    })

    soundRef.current = sound
    setCurrentSound(sound)
    sound.play()
  }

  const stopAlarm = () => {
    if (soundRef.current) {
      soundRef.current.stop()
      setIsPlaying(false)
    }
  }

  const pauseAlarm = () => {
    if (soundRef.current) {
      soundRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resumeAlarm = () => {
    if (soundRef.current) {
      soundRef.current.play()
      setIsPlaying(true)
    }
  }

  const setAlarmVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))
    if (soundRef.current) {
      soundRef.current.volume(newVolume)
    }
  }

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [])

  return {
    isPlaying,
    volume,
    currentSound,
    playAlarm,
    stopAlarm,
    pauseAlarm,
    resumeAlarm,
    setAlarmVolume
  }
}
