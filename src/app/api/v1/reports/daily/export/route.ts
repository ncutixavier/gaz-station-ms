import { NextRequest } from 'next/server'
import { z } from 'zod'

const exportSchema = z.object({
  date: z.string(),
  format: z.enum(['pdf', 'excel']),
  data: z.object({
    date: z.string(),
    totalEssence: z.number(),
    totalMazout: z.number(),
    totalRevenue: z.number()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, format, data } = exportSchema.parse(body)

    if (format === 'pdf') {
      return generatePDF(data, date)
    } else if (format === 'excel') {
      return generateExcel(data, date)
    }

    return new Response('Invalid format', { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data', { status: 400 })
    }
    console.error('Error generating report:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

function generatePDF(data: any, date: string) {
  // Simple PDF generation using basic HTML/CSS
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Daily Report - ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; margin-bottom: 10px; }
        .header p { color: #666; }
        .summary { display: flex; justify-content: space-around; margin: 30px 0; }
        .metric { text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .details { margin-top: 30px; }
        .details table { width: 100%; border-collapse: collapse; }
        .details th, .details td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .details th { background-color: #f8f9fa; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Gas Station Daily Report</h1>
        <p>Report Date: ${new Date(date).toLocaleDateString()}</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="metric">
          <h3>Essence Sold</h3>
          <div class="value">${data.totalEssence} L</div>
        </div>
        <div class="metric">
          <h3>Mazout Sold</h3>
          <div class="value">${data.totalMazout} L</div>
        </div>
        <div class="metric">
          <h3>Total Revenue</h3>
          <div class="value">$${data.totalRevenue}</div>
        </div>
      </div>
      
      <div class="details">
        <h2>Detailed Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Essence Volume</td>
            <td>${data.totalEssence} L</td>
          </tr>
          <tr>
            <td>Mazout Volume</td>
            <td>${data.totalMazout} L</td>
          </tr>
          <tr>
            <td>Total Volume</td>
            <td>${(data.totalEssence + data.totalMazout)} L</td>
          </tr>
          <tr>
            <td>Total Revenue</td>
            <td>$${data.totalRevenue}</td>
          </tr>
          <tr>
            <td>Average Price per Liter</td>
            <td>$${(data.totalRevenue / (data.totalEssence + data.totalMazout))}</td>
          </tr>
        </table>
      </div>
      
      <div class="footer">
        <p>This report was generated automatically by the Gas Station Management System</p>
      </div>
    </body>
    </html>
  `

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="daily-report-${date}.html"`
    }
  })
}

function generateExcel(data: any, date: string) {
  // Simple CSV generation (Excel-compatible)
  const csv = `Gas Station Daily Report - ${date}
Generated on: ${new Date().toLocaleString()}

Summary:
Metric,Value
Essence Sold (L),${data.totalEssence}
Mazout Sold (L),${data.totalMazout}
Total Volume (L),${(data.totalEssence + data.totalMazout)}
Total Revenue (USD),${data.totalRevenue}
Average Price per Liter (USD),${(data.totalRevenue / (data.totalEssence + data.totalMazout))}

Detailed Breakdown:
Date,Essence Volume (L),Mazout Volume (L),Total Volume (L),Total Revenue (USD)
${date},${data.totalEssence},${data.totalMazout},${(data.totalEssence + data.totalMazout)},${data.totalRevenue}`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="daily-report-${date}.csv"`
    }
  })
}
