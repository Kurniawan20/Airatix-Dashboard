'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

interface PaymentQRCodeProps {
  participantId: number
  amount: number
  orderId?: string
}

const PaymentQRCode = ({ participantId, amount, orderId }: PaymentQRCodeProps) => {
  // Generate a fake QR code URL based on participant data
  const generateQRCodeUrl = () => {
    // In a real app, this would call an API to generate a QR code
    // For now, we'll use a placeholder QR code service
    const description = `Registration Fee for Participant #${participantId}`
    const reference = orderId || `REG-${participantId}`

    // Using QR code generator service (this is a placeholder URL)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT:${amount}:${reference}:${description}`
  }

  const qrCodeUrl = generateQRCodeUrl()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader title='Payment Information' />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Registration Fee: {formatCurrency(amount)}
          </Typography>

          <Box
            component='img'
            src={qrCodeUrl}
            alt='Payment QR Code'
            sx={{
              width: 200,
              height: 200,
              border: '1px solid',
              borderColor: 'divider',
              p: 1
            }}
          />

          <Typography variant='body2' color='text.secondary' sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
            Scan this QR code to complete payment
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            Payment Details:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Amount:
            </Typography>
            <Typography variant='body2'>{formatCurrency(amount)}</Typography>

            <Typography variant='body2' color='text.secondary'>
              Reference ID:
            </Typography>
            <Typography variant='body2'>{orderId || `REG-${participantId}`}</Typography>

            <Typography variant='body2' color='text.secondary'>
              Participant ID:
            </Typography>
            <Typography variant='body2'>{participantId}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 4, bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            Payment instructions: Scan the QR code above using your mobile banking app or e-wallet. The payment will be
            automatically recorded in our system once completed. For assistance, please contact our support team.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PaymentQRCode
