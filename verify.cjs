const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('index.html','utf8');
for(const s of h.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(s[1]);
const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
const duplicates=ids.filter((v,i)=>ids.indexOf(v)!==i);
const broken=[...h.matchAll(/href="#([^"]+)"/g)].map(x=>x[1]).filter(x=>!ids.includes(x));
console.log(JSON.stringify({scriptSyntax:'OK',duplicates,brokenAnchors:broken,css:fs.existsSync('premium.css')},null,2));
if(duplicates.length||broken.length)process.exitCode=1;
