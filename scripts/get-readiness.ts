import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL,
    password: process.env.TONAL_PASSWORD,
  })
  const readiness = await client.getMuscleReadiness()
  console.log(JSON.stringify(readiness, null, 2))
}

main()
