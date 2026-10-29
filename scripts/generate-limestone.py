"""Original deterministic limestone color tile: 1.2m square, staggered 60x30cm blocks."""
import math, random, struct, zlib
from pathlib import Path
rng=random.Random(912)
w=h=1024
colors=[[rng.uniform(-5,5) for _ in range(2)] for _ in range(4)]
raw=bytearray()
for y in range(h):
 raw.append(0)
 row=y//256
 for x in range(w):
  xx=(x+(256 if row%2 else 0))%1024
  joint=min(y%256,255-y%256)<2 or min(xx%512,511-xx%512)<2
  variation=colors[row][xx//512]+2*math.sin(2*math.pi*x/w)*math.cos(6*math.pi*y/h)+rng.uniform(-3,3)
  base=(191,181,161) if joint else (210,196,170)
  raw.extend(max(0,min(255,round(c+variation))) for c in base)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
p=Path('public/textures/limestone-beige.png')
p.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
