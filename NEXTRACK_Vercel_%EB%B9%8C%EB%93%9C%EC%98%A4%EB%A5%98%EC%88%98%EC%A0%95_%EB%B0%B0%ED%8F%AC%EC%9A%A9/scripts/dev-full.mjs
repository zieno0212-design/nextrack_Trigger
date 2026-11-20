import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
if(!existsSync('.env')){console.error('먼저 cp .env.example .env 실행 후 설정해주세요');process.exit(1)}
const processes=[spawn('npm',['run','start:api'],{stdio:'inherit'}),spawn('npm',['run','dev'],{stdio:'inherit'})];
const stop=()=>{for(const p of processes)p.kill('SIGTERM')};
process.on('SIGINT',()=>{stop();process.exit(0)});process.on('SIGTERM',()=>{stop();process.exit(0)});
