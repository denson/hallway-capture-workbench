import * as T from 'three';
export const materialNames=['original','limestone','oak','wallpaper','plaster','fabric'] as const;
export type MaterialPreset=typeof materialNames[number];
export function makeMaterial(preset:MaterialPreset){
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;
 ctx.fillStyle=preset==='oak'?'#b28a5e':preset==='wallpaper'?'#d5ddc7':preset==='fabric'?'#dcd3bf':'#d5c3a4';ctx.fillRect(0,0,512,512);
 let seed=97;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 for(let i=0;i<12000;i++){ctx.fillStyle=`rgba(60,40,20,${rand()*.08})`;ctx.fillRect(rand()*512,rand()*512,preset==='oak'?1:2,preset==='oak'?30:2);}
 if(preset==='limestone'){ctx.strokeStyle='#b5a68b';ctx.lineWidth=2;for(let y=0;y<512;y+=128){ctx.strokeRect(0,y,512,128);ctx.beginPath();ctx.moveTo(y%256?128:256,y);ctx.lineTo(y%256?128:256,y+128);ctx.stroke();}}
 if(preset==='wallpaper'){ctx.strokeStyle='#819273';ctx.fillStyle='#9eae8c';for(let x=32;x<512;x+=128)for(let y=0;y<512;y+=128){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30,y+128);ctx.stroke();for(let k=1;k<5;k++){ctx.beginPath();ctx.ellipse(x+k*6+(k%2?10:-8),y+k*24,14,5,k%2?-.6:.6,0,Math.PI*2);ctx.fill();}}}
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;
 const material=new T.MeshStandardMaterial({color:preset==='plaster'?'#eee9de':'#ffffff',map:preset==='plaster'?null:texture,roughness:preset==='oak'?.65:.94,metalness:0});
 if(preset==='plaster')texture.dispose();material.name='Finish: '+preset;return material;
}
