"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

export default function GiftCardGenerator() {
  const [name, setName] = useState("")
  const [textPosition, setTextPosition] = useState({ x: 300, y: 200 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Placeholder image until user uploads their own
  const placeholderImage = "/wmk.jpeg?height=800&width=600"

  useEffect(() => {
    // Load custom font
    const font = new FontFace('cairo', 'url(/arabfontreg.ttf)')
    font.load()
      .then(() => {
        document.fonts.add(font)
        setFontLoaded(true)
        console.log('Font loaded successfully')
      })
      .catch(err => {
        console.error('Error loading font:', err)
        // Fallback to Arial if font fails to load
        setFontLoaded(true)
      })

    // Create image element
    if (!imageRef.current) {
      imageRef.current = new Image()
      imageRef.current.crossOrigin = "anonymous"
      imageRef.current.onload = () => {
        setImageLoaded(true)
        drawCanvas()
      }
      imageRef.current.src = placeholderImage
    }
  }, [])

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas()
    }
  }, [name, textPosition, imageLoaded])

  const drawCanvas = (forDownload = false) => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set fixed canvas dimensions
    const canvasWidth = 1000
    const canvasHeight = 800
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Calculate scaling to maintain aspect ratio
    const scale = Math.min(
      canvasWidth / imageRef.current.width,
      canvasHeight / imageRef.current.height
    )
    const width = imageRef.current.width * scale
    const height = imageRef.current.height * scale
    const x = (canvasWidth - width) / 2
    const y = (canvasHeight - height) / 2

    // Draw scaled image centered
    ctx.drawImage(imageRef.current, x, y, width, height)

    // Draw text
    if (name.trim()) {
      ctx.font = fontLoaded ? "30px cairo" : "30px Arial"
      ctx.fillStyle = "#fca11a"
      ctx.textAlign = "right" // Always right-aligned for Arabic
      ctx.direction = "rtl" // Always RTL for Arabic
      ctx.fillText(name, textPosition.x, textPosition.y)

      // Draw border around text (only when editing, not for download)
      if (!forDownload) {
        const metrics = ctx.measureText(name)
        const textWidth = metrics.width
        const textHeight = 64 // Approximate height for 64px font
        const textLeft = textPosition.x - textWidth // For RTL text
        const textTop = textPosition.y - textHeight

        ctx.strokeStyle = "#3b82f6" // Blue border
        ctx.lineWidth = 2
        ctx.setLineDash([5, 3]) // Dashed line
        ctx.strokeRect(textLeft - 5, textTop - 5, textWidth + 10, textHeight + 10)
        ctx.setLineDash([]) // Reset dash
      }
    }
  }

  const downloadImage = () => {
    if (!canvasRef.current || !imageRef.current) return

    // Create high resolution canvas (2x size but same display dimensions)
    const tempCanvas = document.createElement("canvas")
    const scaleFactor = 2 // Higher scale factor = better quality but larger file
    const canvasWidth = 1000
    const canvasHeight = 800
    tempCanvas.width = canvasWidth
    tempCanvas.height = canvasHeight
    tempCanvas.style.width = "1000px"
    tempCanvas.style.height = "800px"

    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Calculate scaling to maintain aspect ratio
    const scale = Math.min(
      canvasWidth / imageRef.current.width,
      canvasHeight / imageRef.current.height
    )
    const width = imageRef.current.width * scale
    const height = imageRef.current.height * scale
    const x = (canvasWidth - width) / 2
    const y = (canvasHeight - height) / 2

    // Draw scaled image centered
    tempCtx.drawImage(imageRef.current, x, y, width, height)

    // Draw text (without border)
    if (name.trim()) {
      tempCtx.font = fontLoaded ? "30px cairo" : "30px Arial"
      tempCtx.fillStyle = "#fca11a"
      tempCtx.textAlign = "right" // Always right-aligned for Arabic
      tempCtx.direction = "rtl" // Always RTL for Arabic
      tempCtx.fillText(name, textPosition.x, textPosition.y)
    }

    // Download the image
    const link = document.createElement("a")
    link.download = `gift-card-${name}.png`
    link.href = tempCanvas.toDataURL("image/png")
    link.click()
  }

  // Simplified mouse handlers - directly set position on drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!name.trim()) return
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Get mouse position relative to canvas
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    // Set text position directly to mouse position
    setTextPosition({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Simplified touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!name.trim()) return
    e.preventDefault() // Prevent scrolling
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return
    e.preventDefault() // Prevent scrolling

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]

    // Get touch position relative to canvas
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width)
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height)

    // Set text position directly to touch position
    setTextPosition({ x, y })
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center gap-4">
          <CardTitle className="text-2xl">بطاقة معايدة</CardTitle>
          <img src="/wmklogo.png" alt="Wadi Maakah Logo" className="h-15 w-auto" />

        </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className={`border border-gray-300 rounded-md max-w-full ${name.trim() ? "cursor-move" : "cursor-default"}`}
                style={{ maxHeight: "500px", objectFit: "contain" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none border-2 border-blue-500 rounded-md" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {name.trim() ? "انقر واسحب في أي مكان لتحديد موضع النص" : "أدخل اسمك لإضافة نص إلى الصورة"}
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="name-input">الاسم</Label>
              <Input
                id="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل الاسم"
                dir="rtl"
                className="mt-1 text-right"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={downloadImage} className="w-full" disabled={!name.trim()}>
            <Download className="ml-2 h-4 w-4" /> تحميل البطاقة
          </Button>
        </CardFooter>
      </Card>
      <div className="text-center text-gray-500 mt-8 text-sm">
        Developed by Khalid Abdulghani | Powered by Wadi Makkah
      </div>
    </div>
  )
}
