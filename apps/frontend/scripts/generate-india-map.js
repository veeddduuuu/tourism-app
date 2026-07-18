const fs = require("fs");
const gj = JSON.parse(fs.readFileSync("assets/map/india.geojson","utf8"));

// Rename to modern names; skip far-flung tiny island UTs for a clean mainland map.
const RENAME = { "Orissa":"Odisha", "Uttaranchal":"Uttarakhand",
  "Dādra and Nagar Haveli and Damān and Diu":"Dadra & Nagar Haveli",
  "Andaman and Nicobar":"Andaman & Nicobar", "Jammu and Kashmir":"Jammu & Kashmir" };
const SKIP = new Set(["Lakshadweep"]); // tiny, far offshore

// mean latitude for longitude compression (equirectangular)
let latSum=0,n=0;
for(const f of gj.features){
  const polys = f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
  for(const poly of polys) for(const ring of poly) for(const [,lat] of ring){latSum+=lat;n++;}
}
const meanLat = latSum/n, kx = Math.cos(meanLat*Math.PI/180);

// project raw
const proj = ([lng,lat]) => [lng*kx, -lat];

// first pass bbox
let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
for(const f of gj.features){
  if(SKIP.has(f.properties.name)) continue;
  const polys = f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
  for(const poly of polys) for(const ring of poly) for(const c of ring){
    const [x,y]=proj(c); if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y;
  }
}
const W = 1000;
const scale = W/(maxX-minX);
const H = Math.round((maxY-minY)*scale);
const norm = ([lng,lat]) => { const [x,y]=proj([lng,lat]); return [ (x-minX)*scale, (y-minY)*scale ]; };

const r = v => Math.round(v*10)/10;
const TOL = 1.6; // drop points closer than this (in viewBox units)

function ringToPath(ring){
  const pts = ring.map(norm);
  const kept=[];
  for(let i=0;i<pts.length;i++){
    const p=pts[i];
    if(kept.length===0){kept.push(p);continue;}
    const last=kept[kept.length-1];
    const dx=p[0]-last[0], dy=p[1]-last[1];
    if(dx*dx+dy*dy>=TOL*TOL) kept.push(p);
  }
  if(kept.length<3) return "";
  let d=`M${r(kept[0][0])} ${r(kept[0][1])}`;
  for(let i=1;i<kept.length;i++) d+=`L${r(kept[i][0])} ${r(kept[i][1])}`;
  return d+"Z";
}

const out=[];
for(const f of gj.features){
  const rawName=f.properties.name;
  if(SKIP.has(rawName)) continue;
  const name = RENAME[rawName]||rawName;
  const id = f.properties.id || name.replace(/\s+/g,"").toUpperCase();
  const polys = f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates;
  let d="";
  for(const poly of polys) for(const ring of poly){
    // skip tiny rings (islands) to reduce noise
    d += ringToPath(ring);
  }
  if(d){
    // per-state bounding box from the path numbers -> [x, y, w, h]
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    let bx0=1e9,by0=1e9,bx1=-1e9,by1=-1e9;
    for(let i=0;i<nums.length;i+=2){
      const x=nums[i], y=nums[i+1];
      if(x<bx0)bx0=x; if(y<by0)by0=y; if(x>bx1)bx1=x; if(y>by1)by1=y;
    }
    const bbox=[r(bx0),r(by0),r(bx1-bx0),r(by1-by0)];
    out.push({id,name,d,bbox});
  }
}

out.sort((a,b)=>a.name.localeCompare(b.name));
const ts = `// AUTO-GENERATED from assets/map/india.geojson by scripts/generate-india-map.js (do not edit by hand).
// Each state is a tappable SVG path. Projection: equirectangular, viewBox ${W}x${H}.

export const INDIA_VIEWBOX = "0 0 ${W} ${H}";
export const INDIA_WIDTH = ${W};
export const INDIA_HEIGHT = ${H};

export interface StatePath { id: string; name: string; d: string; bbox: [number, number, number, number]; }

export const INDIA_STATES: StatePath[] = ${JSON.stringify(out)};
`;
fs.writeFileSync("constants/indiaMap.ts", ts);
console.log("states:",out.length,"viewBox:",W,"x",H,"file KB:",Math.round(ts.length/1024));
