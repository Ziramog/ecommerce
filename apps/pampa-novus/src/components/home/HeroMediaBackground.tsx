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
          className="object-cover object-right sm:object-[82%_center] lg:object-[84%_center] select-none"
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
        className={`absolute inset-0 w-full h-full object-cover object-[70%_center] lg:object-[75%_center] select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
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
        className={`absolute inset-0 w-full h-full object-cover object-[70%_center] lg:object-[75%_center] select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
          currentStep === 'video1' ? 'opacity-100 z-20' : 'opacity-0 z-0'
        }`}
      />

      {/* Editorial Scrim: Gradiente sofisticado y continuo de izquierda a derecha — casi invisible como efecto, preservando 100% el cine ecuestre */}
      <div
        className="absolute inset-0 pointer-events-none z-30 hidden sm:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(250, 247, 242, 0.95) 0%, rgba(250, 247, 242, 0.92) 32%, rgba(250, 247, 242, 0.84) 48%, rgba(250, 247, 242, 0.55) 62%, rgba(250, 247, 242, 0.20) 74%, rgba(250, 247, 242, 0.03) 86%, rgba(250, 247, 242, 0) 96%)',
        }}
      />
      {/* En mobile: gradiente vertical suave para proteger el bloque superior sin cortar la foto */}
      <div
        className="absolute inset-0 pointer-events-none z-30 sm:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(250, 247, 242, 0.96) 0%, rgba(250, 247, 242, 0.92) 55%, rgba(250, 247, 242, 0.70) 72%, rgba(250, 247, 242, 0.25) 86%, rgba(250, 247, 242, 0) 100%)',
        }}
      />
      {/* Sutil viñeta inferior para integración natural */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#FAF7F2]/30 to-transparent pointer-events-none z-30" />
    </div>
  )
}

export default HeroMediaBackground
