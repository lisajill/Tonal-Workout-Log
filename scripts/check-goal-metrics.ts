import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const ENDURANCE_ID = 'b9bb5c52-a6d4-48ed-bbc5-3a645bb89e15'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const metricScores = await client.getMetricScores()
  const endurance = (metricScores as any)[ENDURANCE_ID] ?? []
  console.log(JSON.stringify(endurance.sort((a: any, b: any) => b.weekNumber - a.weekNumber), null, 2))
}
main()
