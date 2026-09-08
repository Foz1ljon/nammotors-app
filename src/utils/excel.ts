import writeXlsxFile from 'write-excel-file/browser'
import type { Product } from '@/stores/products'

const bold = (text: string) => ({ value: text, fontWeight: 'bold' as const })

export async function exportProductsToExcel(
  items: Product[],
  fileLabel: string,
  statusLabel: (p: Product) => string,
  t: (key: string) => string,
) {
  const columns = [
    { header: bold(t('products.colCode')), cell: (p: Product) => ({ value: p.code }), width: 12 },
    { header: bold(t('products.colName')), cell: (p: Product) => ({ value: p.name }), width: 34 },
    { header: bold(t('products.colModel')), cell: (p: Product) => ({ value: p.model || '-' }), width: 10 },
    {
      header: bold(t('products.colKvt')),
      cell: (p: Product) => (p.kvt != null ? { value: p.kvt, type: Number } : { value: '-' }),
      width: 8,
    },
    {
      header: bold(t('products.colRpm')),
      cell: (p: Product) => (p.rpm != null ? { value: p.rpm, type: Number } : { value: '-' }),
      width: 12,
    },
    { header: bold(t('products.colUnit')), cell: (p: Product) => ({ value: p.unit }), width: 8 },
    { header: bold(t('products.colQuantity')), cell: (p: Product) => ({ value: p.quantity, type: Number }), width: 10 },
    { header: bold(t('products.colMinStock')), cell: (p: Product) => ({ value: p.minStock, type: Number }), width: 10 },
    {
      header: bold(t('products.colPrice')),
      cell: (p: Product) => ({ value: p.price, type: Number, format: '#,##0' }),
      width: 14,
    },
    {
      header: bold(t('products.colTotal')),
      cell: (p: Product) => ({ value: p.price * p.quantity, type: Number, format: '#,##0' }),
      width: 16,
    },
    { header: bold(t('products.colWarehouse')), cell: (p: Product) => ({ value: p.warehouse }), width: 12 },
    { header: bold(t('products.colStatus')), cell: (p: Product) => ({ value: statusLabel(p) }), width: 12 },
  ]

  await writeXlsxFile(items, { columns }).toFile(
    `${fileLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`,
  )
}
