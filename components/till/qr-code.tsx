"use client"

import * as React from "react"
import QRCode from "qrcode"

type QrCodeProps = {
  value: string
  size?: number
  className?: string
}

/**
 * The payment link as a QR the customer scans from the counter screen. Drawn to
 * a canvas rather than fetched as an image so it renders with no network round
 * trip, which matters when someone is standing there waiting.
 */
export function QrCode({ value, size = 208, className }: QrCodeProps) {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    void QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      // High correction, because a counter screen picks up glare and
      // fingerprints and the scan needs to survive both.
      errorCorrectionLevel: "H",
      color: { dark: "#1a1f2eff", light: "#ffffffff" },
    })
  }, [value, size])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={className}
      aria-label="Payment QR code"
      role="img"
    />
  )
}
