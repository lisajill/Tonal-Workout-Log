import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const info = await (client as any).userService.getUserInfo()
  const uid = info.id ?? info.userId ?? info.sub
  const r = await http.request(`/users/${uid}/workout-activities/6cf36c03-1f6a-4c15-bae6-d18dfbbc1022`)
  console.log(JSON.stringify(r, null, 2))
}
main()
