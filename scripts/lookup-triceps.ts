import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const movements = await (client as any).httpClient.request('/movements')
const results = movements.filter((m: any) => m.name.toLowerCase().includes('tricep'))
results.forEach((m: any) => console.log(m.id, m.name))
