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

      // Application colors from theme
      const primaryColor = [102, 108, 255] as [number, number, number] // #666CFF in RGB
      const secondaryColor = [109, 120, 141] as [number, number, number] // #6D788D in RGB
      const successColor = [114, 225, 40] as [number, number, number] // #72E128 in RGB
      const infoColor = [38, 198, 249] as [number, number, number] // #26C6F9 in RGB
      const textColor = [58, 53, 65] as [number, number, number] // Text color
      
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

      // Add a colored header bar
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.rect(0, 0, pageWidth, 15, 'F')
      
      // Add title
      pdf.setFontSize(titleFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0) // Black text
      pdf.text('Participant Registration Form', pageWidth / 2, yPos + 5, { align: 'center' })
      yPos += 15

      // Add event name with colored background
      pdf.setFillColor(infoColor[0], infoColor[1], infoColor[2], 0.1) // Light info color background
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F')
      pdf.setFontSize(normalFontSize)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(textColor[0], textColor[1], textColor[2])
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

      // Add start number in a primary color box
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.rect(pageWidth / 2 - 30, yPos - 8, 60, 16, 'F')
      pdf.setTextColor(255, 255, 255) // White text
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Start Number: #${activeDetail.startNumber}`, pageWidth / 2, yPos, { align: 'center' })
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]) // Reset to text color
      pdf.setFont('helvetica', 'normal')
      yPos += 20

      // Section: Participant Information with styled header
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.1) // Light primary color
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F')
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]) // Primary color text
      pdf.text('Participant Information', margin, yPos)
      yPos += 5
      pdf.setLineWidth(0.5)
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]) // Primary color line
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]) // Reset to text color

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

      // Use autoTable directly with theme colors
      autoTable(pdf, {
        startY: yPos,
        head: [participantInfoData[0]],
        body: participantInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Section: Class Information with styled header
      pdf.setFillColor(infoColor[0], infoColor[1], infoColor[2], 0.1) // Light info color
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F')
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(infoColor[0], infoColor[1], infoColor[2]) // Info color text
      pdf.text('Class Information', margin, yPos)
      yPos += 5
      pdf.setLineWidth(0.5)
      pdf.setDrawColor(infoColor[0], infoColor[1], infoColor[2]) // Info color line
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]) // Reset to text color

      // Create class info table
      const classInfoData = [
        ['Field', 'Value'],
        ['Category Class', activeDetail.categoryClass],
        ['Class Name', activeDetail.className]
      ]

      // Use autoTable directly with theme colors
      autoTable(pdf, {
        startY: yPos,
        head: [classInfoData[0]],
        body: classInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: infoColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Section: Vehicle Information with styled header
      pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2], 0.1) // Light secondary color
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F')
      pdf.setFontSize(headerFontSize)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]) // Secondary color text
      pdf.text('Vehicle Information', margin, yPos)
      yPos += 5
      pdf.setLineWidth(0.5)
      pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]) // Secondary color line
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 10
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]) // Reset to text color

      // Create vehicle info table
      const vehicleInfoData = [
        ['Field', 'Value'],
        ['Vehicle Brand', activeDetail.vehicleBrand],
        ['Vehicle Type', activeDetail.vehicleType],
        ['Vehicle Color', activeDetail.vehicleColor],
        ['Chassis Number', activeDetail.chassisNumber],
        ['Engine Number', activeDetail.engineNumber]
      ]

      // Use autoTable directly with theme colors
      autoTable(pdf, {
        startY: yPos,
        head: [vehicleInfoData[0]],
        body: vehicleInfoData.slice(1),
        theme: 'grid',
        headStyles: { 
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        styles: { fontSize: normalFontSize }
      })

      // Get the final Y position after the table
      // @ts-ignore - lastAutoTable is added by the jspdf-autotable plugin
      yPos = pdf.lastAutoTable.finalY + 10

      // Add note with styled background
      pdf.setFillColor(successColor[0], successColor[1], successColor[2], 0.1) // Light success color
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F')
      pdf.setFontSize(normalFontSize)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(successColor[0], successColor[1], successColor[2]) // Success color text
      
      pdf.text('This is an official registration document. Please keep it for your records.', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Add signature lines with primary color
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]) // Primary color text
      pdf.setFont('helvetica', 'normal')
      
      // Draw signature lines in primary color
      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.line(margin + 10, yPos + 10, margin + 50, yPos + 10); // Left signature line
      pdf.line(pageWidth - margin - 50, yPos + 10, pageWidth - margin - 10, yPos + 10); // Right signature line
      
      // Participant signature
      pdf.text('Participant Signature', margin + 30, yPos + 20, { align: 'center' })
      
      // Official signature
      pdf.text('Official Signature', pageWidth - margin - 30, yPos + 20, { align: 'center' })

      // Add a colored footer bar
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      pdf.rect(0, pdf.internal.pageSize.height - 10, pageWidth, 10, 'F')

      
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
