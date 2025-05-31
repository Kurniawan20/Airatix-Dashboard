'use client'

// React Imports
import { useState, useEffect } from 'react'

// Auth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'
import ReactApexcharts from 'react-apexcharts'

// API Config Imports
import { API_ENDPOINTS, fetchWithAuthFallback } from '@/utils/apiConfig'

// Types for the API response
interface MonthlyTotal {
  month: number
  month_name: string
  total_gross: number
  transaction_count: number
}

interface MonthlyGrossResponse {
  message: string
  data: {
    year: number
    year_total: number
    year_transaction_count: number
    monthly_totals: MonthlyTotal[]
  }
}

const MonthlyRevenueChart = () => {
  // State for year filter and data
  const [year, setYear] = useState<string>(new Date().getFullYear().toString())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{
    year_total: number
    monthly_totals: MonthlyTotal[]
  } | null>(null)
  
  // Get session data for user role
  const { data: session } = useSession()
  
  // Check if user is an EO or admin
  const organizerId = session?.user?.organizerId
  const isEO = organizerId && organizerId !== 0 && organizerId !== '0'


  // Available years for the dropdown
  const availableYears = ['2024', '2025']

  // Fetch data when year changes or session changes
  useEffect(() => {
    const fetchMonthlyGross = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use organizer-specific endpoint if user is an EO, otherwise use the admin endpoint
        const endpoint = isEO
          ? API_ENDPOINTS.TRANSACTIONS.ORGANIZER_MONTHLY_GROSS(organizerId, parseInt(year))
          : API_ENDPOINTS.TRANSACTIONS.MONTHLY_GROSS(parseInt(year))

        const response = await fetchWithAuthFallback(endpoint)

        if (!response.ok) {
          throw new Error('Failed to fetch monthly gross data')
        }

        const responseText = await response.text()

        if (!responseText) {
          throw new Error('Empty response from server')
        }

        const result: MonthlyGrossResponse = JSON.parse(responseText)
        console.log('Monthly gross data:', result)

        setChartData({
          year_total: result.data.year_total,
          monthly_totals: result.data.monthly_totals
        })
      } catch (err) {
        console.error('Error fetching monthly gross data:', err)
        setError('Failed to load monthly gross data')

        // Set fallback data
        setChartData({
          year_total: 0,
          monthly_totals: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            month_name: new Date(0, i).toLocaleString('default', { month: 'long' }),
            total_gross: 0,
            transaction_count: 0
          }))
        })

      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyGross()
  }, [year, session, organizerId, isEO])

  // Format the revenue for display (IDR currency)
  const formatRevenue = (value: number) => {
    return `IDR ${value.toLocaleString()}`
  }

  // Prepare data for the chart
  const getChartOptions = (): ApexOptions => {
    if (!chartData) return {} as ApexOptions

    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 0
      },
      grid: {
        borderColor: '#f5f5f5',
        row: {
          colors: ['transparent']
        }
      },
      xaxis: {
        categories: chartData.monthly_totals.map(item => item.month_name),
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            // Format based on the value range
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}K`
            }
            return value.toString()
          }
        }
      },
      fill: {
        opacity: 1,
        colors: ['#3f51b5'] // Primary color to match the Total Revenue card
      },
      tooltip: {
        y: {
          formatter: function (value: number) {
            return formatRevenue(value)
          }
        }
      },
      colors: ['#3f51b5'] // Primary color to match the Total Revenue card
    } as ApexOptions
  }

  // Handle year change
  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setYear(event.target.value as string)
  }

  return (
    <Card>
      <CardHeader
        title='Monthly Revenue'
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel id='year-select-label'>Year</InputLabel>
            <Select
              labelId='year-select-label'
              id='year-select'
              value={year}
              label='Year'
              onChange={handleYearChange as any}
            >
              {availableYears.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant='h3' sx={{ fontWeight: 'bold' }}>
                {formatRevenue(chartData?.year_total || 0)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Total Revenue for {year}
              </Typography>
            </Box>

            <ReactApexcharts
              type='bar'
              height={350}
              series={[
                {
                  name: 'Revenue',
                  data: chartData?.monthly_totals.map(item => item.total_gross) || []
                }
              ]}
              options={getChartOptions()}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default MonthlyRevenueChart
