'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type MediaStep = 'video1' | 'video2' | 'image'

export function HeroMediaBackground() {
  const [currentStep, setCurrentStep] = useState<MediaStep>('video1')
  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  // Ensure muted is explicitly applied on DOM elements for browser autoplay compliance
  useEffect(() => {
    if (video1Ref.current) video1Ref.current.muted = true
    if (video2Ref.current) video2Ref.current.muted = true
  }, [])

  // Manage playlist transitions
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (currentStep === 'video1') {
      const v1 = video1Ref.current
      if (v1) {
        v1.currentTime = 0
        v1.play().catch(() => {
          // If video playback fails, advance to next step smoothly
          setCurrentStep('video2')
        })
      }
    } else if (currentStep === 'video2') {
      const v2 = video2Ref.current
      if (v2) {
        v2.currentTime = 0
        v2.play().catch(() => {
          // If video playback fails, advance to image step
          setCurrentStep('image')
        })
      }
    } else if (currentStep === 'image') {
      // Pause any background videos while showing the image
      if (video1Ref.current) video1Ref.current.pause()
      if (video2Ref.current) video2Ref.current.pause()

      // Display the master photo for exactly 10 seconds, then loop back to video1
      timer = setTimeout(() => {
        setCurrentStep('video1')
      }, 10000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentStep])

  const handleVideo1Ended = () => {
    setCurrentStep('video2')
  }

  const handleVideo2Ended = () => {
    setCurrentStep('image')
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#2E1C12]">
      {/* 0. Fallback and Step 3: Master Equestrian Photography (displayed for 10s and as immediate base) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-equestrian-master.webp"
          alt="Raíces ecuestres, estilo contemporáneo — Pampa Novus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center] sm:object-[70%_center] lg:object-[65%_center] select-none"
        />
      </div>

      {/* 2. Step 2: Second Video (hero_video2.mp4) */}
      <video
        ref={video2Ref}
        src="/images/home/hero_video2.mp4"
        muted
        playsInline
        preload="auto"
        onEnded={handleVideo2Ended}
        onError={() => setCurrentStep('image')}
        className={`absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
          currentStep === 'video2' ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      />

      {/* 1. Step 1: First Video (hero_video.mp4) — Starts the sequence */}
      <video
        ref={video1Ref}
        src="/images/home/hero_video.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={handleVideo1Ended}
        onError={() => setCurrentStep('video2')}
        className={`absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
          currentStep === 'video1' ? 'opacity-100 z-20' : 'opacity-0 z-0'
        }`}
      />

      {/* Gradiente progresivo suave y cálido: asegura lectura óptima de titulares y CTA sobre cualquier fotograma */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/75 via-[#FAF7F2]/30 to-transparent sm:from-[#FAF7F2]/55 sm:via-[#FAF7F2]/15 lg:to-transparent pointer-events-none z-30" />
    </div>
  )
}

export default HeroMediaBackground
