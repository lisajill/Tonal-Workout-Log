import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL, password: process.env.TONAL_PASSWORD })
  const http = (client as any).httpClient
  const userId = (client as any).userId
  // Also try the Glute & Core session for comparison
  const data = await http.request(`/users/${userId}/workout-activities/53adbfc8-8448-4abf-913e-a9ae9123553f`)
  const sets = data.workoutSetActivity ?? []
  // Print keys from first set
  console.log('Keys on set object:', Object.keys(sets[0] ?? {}))
  console.log('First set:', JSON.stringify(sets[0], null, 2))
}
main()
