import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const uid = userInfo.id

  // Get recent activities
  const activities = await client.getActivitySummaries()
  const recent = activities
    .filter((a: any) => a.activityType === 'Internal')
    .sort((a: any, b: any) => new Date(b.localTimestamp ?? b.endTimestamp).getTime() - new Date(a.localTimestamp ?? a.endTimestamp).getTime())
    .slice(0, 3)

  console.log('RECENT:')
  recent.forEach((a: any) => console.log(JSON.stringify({
    id: a.id,
    name: a.name,
    timestamp: a.localTimestamp,
    duration: a.duration,
    totalVolume: a.totalVolume,
    totalReps: a.totalReps,
    timeUnderTension: a.timeUnderTension,
    totalWorkKj: a.totalWorkKj,
  })))

  // Post readiness
  const readiness = await http.request(`/users/${uid}/muscle-readiness/current`)
  console.log('\nPOST_READINESS:', JSON.stringify(readiness))
}

main().catch(console.error)
