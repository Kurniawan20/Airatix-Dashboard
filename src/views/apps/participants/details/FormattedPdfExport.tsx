'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import { default as JsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import type { Participant, ParticipantDetail } from '@/types/participant'

interface FormattedPdfExportProps {
  participant: Participant
  activeDetail: ParticipantDetail | null
}

const FormattedPdfExport = ({ participant, activeDetail }: FormattedPdfExportProps) => {
  const [loading, setLoading] = useState(false)

  const handleExportPdf = async () => {
    if (!activeDetail) return

    setLoading(true)

    try {
      // Create a new jsPDF instance
      const pdf = new JsPDF('portrait', 'mm', 'a4')
      
      // Set document properties
      pdf.setProperties({
        title: `Participant-${participant.name}-Registration`,
        subject: 'Participant Registration Form',
        author: 'Airatix System',
        creator: 'Airatix EO Management'
      })

      // Set font sizes and styles
      const titleFontSize = 16
      const headerFontSize = 14
      const normalFontSize = 10
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.width
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Current Y position tracker
      let yPos = margin

      // Add title
      pdf.setFontSize(titleFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Participant Registration Form', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Add event name
      pdf.setFontSize(normalFontSize)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Drag Racing Event Registration', pageWidth / 2, yPos, { align: 'center' })
      yPos += 8

      // Add registration date
      const registrationDate = new Date(participant.registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })
      
      pdf.text(`Registration Date: ${registrationDate}`, pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Add start number in a blue box
      pdf.setFillColor(51, 51, 255) // Blue color
      pdf.rect(pageWidth / 2 - 30, yPos - 8, 60, 16, 'F')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Start Number: #${activeDetail.startNumber}`, pageWidth / 2, yPos, { align: 'center' })
      pdf.setTextColor(0, 0, 0) // Reset to black text
      pdf.setFont('helvetica', 'normal')
      yPos += 20

      // Section: Participant Information
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Participant Information', margin, yPos)
      yPos += 5
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10

      // Create participant info table
      const participantInfoData = [
        ['Field', 'Value'],
        ['Name', participant.name],
        ['NIK', participant.nik],
        ['Province', participant.province],
        ['City', participant.city],
        ['Team', participant.team],
        ['Phone Number', activeDetail.phoneNumber || 'N/A'],
        ['POS', activeDetail.pos || 'N/A']
      ]

      // Use autoTable directly
      autoTable(pdf, {
        startY: yPos,
        head: [participantInfoData[0]],
        body: participantInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [51, 51, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Section: Class Information
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Class Information', margin, yPos)
      yPos += 5
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10

      // Create class info table
      const classInfoData = [
        ['Field', 'Value'],
        ['Category Class', activeDetail.categoryClass],
        ['Class Name', activeDetail.className]
      ]

      // Use autoTable directly
      autoTable(pdf, {
        startY: yPos,
        head: [classInfoData[0]],
        body: classInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [51, 51, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Section: Vehicle Information
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Vehicle Information', margin, yPos)
      yPos += 5
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10

      // Create vehicle info table
      const vehicleInfoData = [
        ['Field', 'Value'],
        ['Vehicle Brand', activeDetail.vehicleBrand],
        ['Vehicle Type', activeDetail.vehicleType],
        ['Vehicle Color', activeDetail.vehicleColor],
        ['Chassis Number', activeDetail.chassisNumber],
        ['Engine Number', activeDetail.engineNumber]
      ]

      // Use autoTable directly
      autoTable(pdf, {
        startY: yPos,
        head: [vehicleInfoData[0]],
        body: vehicleInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: [51, 51, 255],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Add note
      pdf.setFontSize(normalFontSize)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(100, 100, 100) // Gray text
      
      pdf.text('This is an official registration document. Please keep it for your records.', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Add signature lines
      pdf.setTextColor(0, 0, 0) // Reset to black text
      pdf.setFont('helvetica', 'normal')
      
      // Draw signature lines
      pdf.line(margin + 10, yPos + 10, margin + 50, yPos + 10); // Left signature line
      pdf.line(pageWidth - margin - 50, yPos + 10, pageWidth - margin - 10, yPos + 10); // Right signature line
      
      // Participant signature
      pdf.text('Participant Signature', margin + 30, yPos + 20, { align: 'center' })
      
      // Official signature
      pdf.text('Official Signature', pageWidth - margin - 30, yPos + 20, { align: 'center' })

      // Save the PDF
      const fileName = `Participant-${participant.name}-${activeDetail.startNumber}.pdf`
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
      disabled={loading || !activeDetail}
      sx={{ ml: 2 }}
    >
      {loading ? 'Generating PDF...' : 'Export Form PDF'}
    </Button>
  )
}

export default FormattedPdfExport
