import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const movements = await (client as any).httpClient.request('/movements')
const results = movements.filter((m: any) =>
  m.name.toLowerCase().includes('pilates') ||
  m.tags?.some((t: any) => t.toLowerCase().includes('pilates'))
)
console.log(`Found ${results.length} pilates movements:`)
console.log(JSON.stringify(results.map((m: any) => ({ id: m.id, name: m.name, tags: m.tags })), null, 2))
