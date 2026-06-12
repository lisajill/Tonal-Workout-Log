import { readFileSync, writeFileSync } from 'fs'

const path = 'src/data/zone2_log.json'
const log = JSON.parse(readFileSync(path, 'utf8'))
const idx = log.findIndex((e: any) => e.uuid === 'C66E247A-69A2-4D2B-ADB4-645B0B403D75')
if (idx === -1) throw new Error('Rowing entry not found')

const e = log[idx]
e.avg_hr = 122
e.rowing_program = 'Beginner Camp #3 of 11'
e.rowing_distance_m = 1565
e.rowing_duration_min = 10
e.rowing_avg_split = '3:11.7'
e.rowing_stroke_rate_spm = 25
e.rowing_avg_watts = null   // peak power was 61W; avg not captured
e.notes = 'Peak power 61W. Cooldown (Cool Down with the Dolphins, 590m, 5min, 104bpm) pending sync — merge when imported.'

writeFileSync(path, JSON.stringify(log, null, 2))
console.log('Updated rowing entry:', JSON.stringify(e, null, 2))
