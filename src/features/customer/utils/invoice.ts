import type { OrderWithItems } from '@/features/customer/types'

/** Soft, calm invoice palette — no harsh fills */
const INK: [number, number, number] = [34, 34, 34]
const MUTED: [number, number, number] = [110, 110, 110]
const RULE: [number, number, number] = [230, 230, 230]
const SOFT_BG: [number, number, number] = [252, 248, 247]
const ACCENT: [number, number, number] = [196, 78, 86]
const WHITE: [number, number, number] = [255, 255, 255]

function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

function statusLabel(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function safeFilename(orderNumber: string): string {
  return `Fudexa-Invoice-${orderNumber.replace(/[^\w.-]+/g, '_')}.pdf`
}

/**
 * Generate and download a clean, simple PDF invoice for a customer order.
 */
export async function downloadOrderInvoice(order: OrderWithItems): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 52
  const right = pageWidth - margin
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // White page
  doc.setFillColor(...WHITE)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Brand + title
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Fudexa', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text('Invoice', right, y, { align: 'right' })
  y += 10

  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.8)
  doc.line(margin, y + 8, right, y + 8)
  y += 32

  // Order meta — two columns
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...INK)
  doc.text(order.restaurant?.name ?? 'Restaurant', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  doc.text(order.order_number, right, y, { align: 'right' })
  y += 16

  doc.setFontSize(9)
  doc.text(`Status · ${statusLabel(order.status)}`, margin, y)
  doc.text(new Date(order.created_at).toLocaleString(), right, y, { align: 'right' })
  y += 14
  doc.text(`Payment · ${order.payment_method} · ${order.payment_status}`, margin, y)
  y += 28

  // Delivery
  doc.setFillColor(...SOFT_BG)
  doc.roundedRect(margin, y, contentWidth, 52, 5, 5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('DELIVERY', margin + 14, y + 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  const addressLines = doc.splitTextToSize(order.delivery_address || '—', contentWidth - 28)
  doc.text(addressLines, margin + 14, y + 34)
  y += 68

  if (order.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text('NOTES', margin, y)
    y += 13
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    const noteLines = doc.splitTextToSize(order.notes, contentWidth)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 12 + 18
  }

  // Table header — simple underline, no colored bar
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('ITEM', margin, y)
  doc.text('QTY', margin + contentWidth * 0.62, y)
  doc.text('AMOUNT', right, y, { align: 'right' })
  y += 6
  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.7)
  doc.line(margin, y, right, y)
  y += 18

  const items = order.order_items ?? []
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  for (const item of items) {
    if (y > 700) {
      doc.addPage()
      doc.setFillColor(...WHITE)
      doc.rect(0, 0, pageWidth, pageHeight, 'F')
      y = margin
    }

    const name = item.menu_item?.name ?? 'Item'
    doc.setTextColor(...INK)
    doc.text(name, margin, y)
    doc.setTextColor(...MUTED)
    doc.text(String(item.quantity), margin + contentWidth * 0.62, y)
    doc.setTextColor(...INK)
    doc.text(money(Number(item.subtotal)), right, y, { align: 'right' })
    y += 10
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.4)
    doc.line(margin, y, right, y)
    y += 16
  }

  y += 10

  // Totals — right-aligned, minimal
  const labelX = right - 150
  const drawTotalRow = (label: string, value: string, emphasize = false) => {
    doc.setFont('helvetica', emphasize ? 'bold' : 'normal')
    doc.setFontSize(emphasize ? 11 : 9)
    doc.setTextColor(...(emphasize ? INK : MUTED))
    doc.text(label, labelX, y)
    doc.setTextColor(...INK)
    doc.text(value, right, y, { align: 'right' })
    y += emphasize ? 18 : 14
  }

  drawTotalRow('Subtotal', money(Number(order.subtotal)))
  drawTotalRow('Tax', money(Number(order.tax)))
  drawTotalRow('Delivery', money(Number(order.delivery_fee)))
  if (Number(order.discount) > 0) {
    drawTotalRow('Discount', `−${money(Number(order.discount))}`)
  }

  y += 4
  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.8)
  doc.line(labelX, y, right, y)
  y += 16
  drawTotalRow('Total', money(Number(order.total)), true)

  // Footer
  const footerY = pageHeight - 40
  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 14, right, footerY - 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Thank you for ordering with Fudexa.', margin, footerY)
  doc.text('fudexa.app', right, footerY, { align: 'right' })

  doc.save(safeFilename(order.order_number))
}
