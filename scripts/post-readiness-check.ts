import TonalClient from '@dlwiest/ts-tonal-client';
import * as dotenv from 'dotenv';
dotenv.config();

const username = process.env.TONAL_EMAIL!;
const password = process.env.TONAL_PASSWORD!;
const client = await TonalClient.create({ username, password });
const http = (client as any).httpClient;
const userInfo = await (client as any).userService.getUserInfo();
const userId = userInfo.id ?? userInfo.userId ?? userInfo.sub;
const res = await http.request(`/users/${userId}/muscle-readiness/current`);
console.log(JSON.stringify(res, null, 2));
