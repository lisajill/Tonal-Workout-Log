import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const query = process.argv[2] ?? 'bench press'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL,
    password: process.env.TONAL_PASSWORD,
  })
  const catalog = await client.getMovements()
  const results = catalog.filter((m: any) =>
    m.name?.toLowerCase().includes(query.toLowerCase())
  )
  results.forEach((m: any) => console.log(`${m.id}  ${m.name}`))
  if (results.length === 0) console.log('No matches.')
}

main()
