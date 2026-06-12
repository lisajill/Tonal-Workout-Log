import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const movements = await (client as any).httpClient.request('/movements')
const terms = ['chest press', 'tricep pushdown', 'face pull', 'triceps pushdown']
for (const term of terms) {
  const results = movements.filter((m: any) => m.name.toLowerCase().includes(term))
  console.log(`\n"${term}":`)
  results.forEach((m: any) => console.log(`  ${m.id}  ${m.name}`))
}
