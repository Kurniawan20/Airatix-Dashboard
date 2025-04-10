'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// Third-party Imports
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Type Imports
import type { Participant } from '@/types/participant'

interface ExportButtonProps {
  participants: Participant[]
  disabled?: boolean
}

const ExportButton = ({ participants, disabled = false }: ExportButtonProps) => {
  // States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Handlers
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Helper function to get the first detail from the details array
  const getFirstDetail = (participant: Participant) => {
    return participant.details && participant.details.length > 0 ? participant.details[0] : null
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(16)
    doc.text('Participants List', 14, 15)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)
    
    // Prepare table data
    const tableData = participants.map(participant => {
      const detail = getFirstDetail(participant)

      return [
        detail?.startNumber || '-',
        participant.name || '-',
        participant.nik || '-',
        participant.city || '-',
        participant.team || '-',
        detail?.className || '-',
        detail?.vehicleType || '-',
        participant.status || '-',
        participant.registrationDate ? new Date(participant.registrationDate).toLocaleDateString() : '-'
      ]
    })
    
    // Add table
    autoTable(doc, {
      head: [['Start #', 'Name', 'NIK', 'City', 'Team', 'Class', 'Vehicle', 'Status', 'Reg. Date']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    })
    
    // Save the PDF
    doc.save(`Participants_List_${new Date().toISOString().split('T')[0]}.pdf`)
    
    handleClose()
  }

  // Export to Excel (CSV)
  const handleExportExcel = () => {
    // Prepare CSV data
    const headers = ['Start Number', 'Name', 'NIK', 'City', 'Province', 'Team', 'Category', 'Class', 'Vehicle Brand', 'Vehicle Type', 'Status', 'Registration Date', 'Order ID']
    
    const rows = participants.map(participant => {
      const detail = getFirstDetail(participant)

      return [
        detail?.startNumber || '',
        participant.name || '',
        participant.nik || '',
        participant.city || '',
        participant.province || '',
        participant.team || '',
        detail?.categoryClass || '',
        detail?.className || '',
        detail?.vehicleBrand || '',
        detail?.vehicleType || '',
        participant.status || '',
        participant.registrationDate ? new Date(participant.registrationDate).toLocaleDateString() : '',
        participant.orderId || ''
      ]
    })
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Participants_List_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    handleClose()
  }

  // Render the export button with dropdown menu
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<i className="ri-download-line" />}
        onClick={handleClick}
        disabled={disabled || participants.length === 0}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <i className="ri-file-pdf-line" style={{ fontSize: '1.25rem', color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <i className="ri-file-excel-line" style={{ fontSize: '1.25rem', color: '#4caf50' }} />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default ExportButton
