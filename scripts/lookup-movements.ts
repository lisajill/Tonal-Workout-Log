import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const movements = await (client as any).httpClient.request('/movements')
const terms = ['seated row', 'suitcase deadlift', 'neutral grip deadlift', 'goblet squat']
const results = movements.filter((m: any) =>
  terms.some(t => m.name?.toLowerCase().includes(t))
)
results.forEach((m: any) => console.log(m.id, '|', m.name))
