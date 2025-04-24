'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import { default as JsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

import type { Participant } from '@/types/participant'

interface ExportPdfButtonProps {
  participant: Participant
  contentRef: React.RefObject<HTMLDivElement>
}

const ExportPdfButton = ({ participant, contentRef }: ExportPdfButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleExportPdf = async () => {
    if (!contentRef.current) return

    setLoading(true)

    try {
      const contentElement = contentRef.current
      
      // Create a new jsPDF instance
      const pdf = new JsPDF('portrait', 'mm', 'a4')
      
      // Set document properties
      pdf.setProperties({
        title: `Participant-${participant.name}-Details`,
        subject: 'Participant Registration Details',
        author: 'Airatix System',
        creator: 'Airatix EO Management'
      })
      
      // Capture the content as canvas
      const canvas = await html2canvas(contentElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      // Calculate the width and height to fit on A4
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Add the canvas as image to PDF
      const imgData = canvas.toDataURL('image/png')
      
      // If the content is longer than one page, split it into multiple pages
      let heightLeft = imgHeight
      let position = 0
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Save the PDF
      const fileName = `Participant-${participant.name}-${participant.id}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleExportPdf}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className="ri-file-pdf-line" />}
      disabled={loading}
      sx={{ ml: 2 }}
    >
      {loading ? 'Generating PDF...' : 'Export PDF'}
    </Button>
  )
}

export default ExportPdfButton
