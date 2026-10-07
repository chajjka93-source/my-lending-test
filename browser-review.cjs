const fs=require('fs');
(async()=>{
 const pages=await (await fetch('http://127.0.0.1:9333/json')).json();
 const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,m=>m.error?reject(m.error):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
 const evalJS=async expression=>(await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 await call('Page.enable');
 await call('Page.navigate',{url:'file:///C:/Users/Марина/Documents/Projects/my-lending-test/index.html'});
 await new Promise(r=>setTimeout(r,1800));
 for(const width of [1440,390]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1000,deviceScaleFactor:1,mobile:width===390});
  await new Promise(r=>setTimeout(r,300));
  console.log(await evalJS(`JSON.stringify({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,background:getComputedStyle(document.body).backgroundColor})`));
  const shot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(width===390?'preview-mobile.png':'preview-desktop.png',Buffer.from(shot.data,'base64'));
 }
 console.log('Interactions:',await evalJS(`(()=>{const b=document.getElementById('burgerBtn');b.click();const opened=b.getAttribute('aria-expanded')==='true';document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));const closed=b.getAttribute('aria-expanded')==='false';const q=document.querySelector('.faq-q');q.click();const faq=q.getAttribute('aria-expanded')==='true';document.getElementById('f-name').value='Анна';document.getElementById('f-email').value='anna@example.com';document.getElementById('f-msg').value='Нужен сайт для студии';document.getElementById('leadForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));const form=document.getElementById('preparedMessage').value.includes('Анна')&&document.getElementById('leadForm').hidden;document.getElementById('resetFormBtn').click();return {opened,closed,faq,form,reset:!document.getElementById('leadForm').hidden}})()`));
 ws.close();
})().catch(e=>{console.error(e);process.exitCode=1});
