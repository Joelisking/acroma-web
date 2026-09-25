import test from 'node:test'
import assert from 'node:assert/strict'
import { startSignupPolling } from './signup-polling.ts'
const flush = () => new Promise(setImmediate)
function clock() {const tasks=[]; return {tasks, schedule: (fn, ms) => {tasks.push({fn,ms}); return 1}, cancel: () => {}, tick: async () => {tasks.shift().fn(); await flush()}}}
const result = (status) => ({ok:true,data:{attemptId:'a',status,message:'test'}})
test('a failed read schedules another read with backoff and can finish', async () => {
  const c=clock(); let reads=0; const delivered=[]
  startSignupPolling({read:async()=>++reads===1?{ok:false,error:'offline'}:result('CONNECTED'),resume:async()=>result('CONNECTED'),apply:r=>delivered.push(r),schedule:c.schedule,cancel:c.cancel})
  await c.tick(); assert.equal(c.tasks[0].ms,3000)
  await c.tick(); assert.equal(reads,2); assert.equal(delivered.at(-1).data.status,'CONNECTED'); assert.equal(c.tasks.length,0)
})
test('an uncertain mutation reads durable state before any retry', async () => {
  const c=clock(); let reads=0; let resumes=0
  startSignupPolling({read:async()=>result(++reads===1?'VALIDATING':'CONNECTED'),resume:async()=>{resumes++;return {ok:false,error:'offline'}},apply:()=>{},schedule:c.schedule,cancel:c.cancel})
  await c.tick(); await c.tick(); assert.equal(resumes,1); assert.equal(reads,2)
})
test('unmount suppresses late results and further scheduling', async () => {
  const c=clock(); let resolve; let applied=0
  const stop=startSignupPolling({read:()=>new Promise(r=>resolve=r),resume:async()=>result('CONNECTED'),apply:()=>applied++,schedule:c.schedule,cancel:c.cancel})
  c.tasks.shift().fn(); stop(); resolve(result('CONNECTED')); await flush()
  assert.equal(applied,0); assert.equal(c.tasks.length,0)
})
