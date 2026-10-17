import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const FS_METRIC_ID = 'e46f85cf-a9bc-42b4-836e-52c6621e7481'
const MQ_METRIC_ID = '5b8646fd-1df0-4b19-8c5b-72f8ad816955'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const targets = await client.getTargetScores()
  console.log('FS target:', JSON.stringify(targets[FS_METRIC_ID]))
  console.log('MQ target:', JSON.stringify(targets[MQ_METRIC_ID]))
}
main()
