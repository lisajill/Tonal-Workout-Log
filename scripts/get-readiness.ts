import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const username = process.env.TONAL_EMAIL!
  const password = process.env.TONAL_PASSWORD!
  const client = await TonalClient.create({ username, password })
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const uid = userInfo.id ?? userInfo.userId ?? userInfo.sub
  console.log('uid:', uid)
  // http.request returns data directly (not a response object)
  const data = await http.request(`/users/${uid}/muscle-readiness/current`)
  console.log(JSON.stringify(data, null, 2))
}

main().catch(console.error)
