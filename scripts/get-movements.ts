import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const uid = userInfo.id

  const ids = [
    '15c98432-6eef-421d-82ca-aa449994fa35', // Week 2 Day 1 (today)
    'a5096dcc-e12f-4bb7-8887-dd0bece5acc5', // Free Lift May 28
  ]

  for (const id of ids) {
    const data = await http.request(`/users/${uid}/workout-activities/${id}`)
    console.log(`\n=== ${id} ===`)
    console.log(JSON.stringify(data, null, 2))
  }
}

main().catch(console.error)
