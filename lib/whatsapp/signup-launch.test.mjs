import test from 'node:test'
import assert from 'node:assert/strict'
import { launchSignup } from './signup-launch.ts'
const attempt={attemptId:'a',nonce:'local',expiresAt:new Date(Date.now()+600000).toISOString(),configurationId:'config'}
function state(){return {active:{current:false},mounted:{current:true},currentId:{current:'a'},receivedCode:{current:false},popupPending:{current:false}}}
test('authorization is dispatched immediately and a final-screen close does not cancel a valid code',()=>{
  const s=state(); let callback; let opts; const codes=[]
  const sdk={login:(cb,options)=>{callback=cb;opts=options}}
  launchSignup(sdk,attempt,s,code=>codes.push(code),()=>{},()=>{})
  // A UI cancellation notice does not mutate the authenticated attempt.
  callback({authResponse:{code:'one-use'}})
  assert.deepEqual(codes,['one-use']); assert.equal(s.active.current,true)
  assert.equal(s.popupPending.current,false); assert.deepEqual(opts.extras,{setup:{}})
})
test('overlapping launches and callbacks belonging to an abandoned attempt are ignored',()=>{
  const s=state(); let callback; let calls=0; let sent=0
  const sdk={login:cb=>{calls++;callback=cb}}
  const launch=()=>launchSignup(sdk,attempt,s,()=>sent++,()=>{},()=>{})
  launch();launch();assert.equal(calls,1)
  s.currentId.current='new';callback({authResponse:{code:'stale'}});assert.equal(sent,0)
})
test('a blocked SDK launch clears the popup guard for retry',()=>{
  const s=state(); let error=''
  launchSignup({login:()=>{throw Error('blocked')}},attempt,s,()=>{},()=>{},value=>error=value)
  assert.equal(s.popupPending.current,false);assert.equal(s.active.current,false);assert.match(error,/Allow popups/)
})
