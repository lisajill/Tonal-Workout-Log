import { readFileSync, writeFileSync } from 'fs'

const path = 'src/data/zone2_log.json'
const log = JSON.parse(readFileSync(path, 'utf8'))
const e = log.find((e: any) => e.uuid === 'C66E247A-69A2-4D2B-ADB4-645B0B403D75')
if (!e) throw new Error('Not found')
e.rowing_avg_watts = 61
e.notes = 'Cooldown (Cool Down with the Dolphins, 590m, 5min, 104bpm, 22W) pending sync — merge when imported.'
writeFileSync(path, JSON.stringify(log, null, 2))
console.log('rowing_avg_watts:', e.rowing_avg_watts)
