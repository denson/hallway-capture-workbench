"""Local, original-preserving video contact sheets with timestamped frame provenance."""
import concurrent.futures, hashlib, json, pathlib, subprocess, sys, time
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path(__file__).resolve().parents[1]
source = root / 'references/video-IMG_3462/IMG_3462.MOV'
out = root / 'references/video-IMG_3462/review'
out.mkdir(parents=True, exist_ok=True)
probe = json.loads((source.parent / 'ffprobe.json').read_text(encoding='utf-8-sig'))
duration = float(probe['format']['duration'])
times = list(range(0, int(duration), 6))
ffmpeg = r'C:\ffmpeg\bin\ffmpeg.exe'
started = time.time()
vf = 'scale=360:-2,zscale=transfer=linear:npl=100,format=gbrpf32le,tonemap=tonemap=mobius:desat=0,zscale=primaries=bt709:transfer=bt709:matrix=bt709:range=full,format=rgb24'

def extract(t):
    file = out / f'frame-{t:03d}.jpg'
    if not file.exists():
        p = subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-threads', '2', '-ss', str(t), '-i', str(source), '-map', '0:v:0', '-frames:v', '1', '-vf', vf, '-q:v', '3', '-y', str(file)], capture_output=True)
        if p.returncode: raise RuntimeError(p.stderr.decode(errors='replace'))
    return {'requested_video_seconds': t, 'timecode': f'{t//60:02d}:{t%60:02d}', 'frame': file.name, 'note': 'Seek to requested timestamp; decoded frame lies on video frame grid. HDR tone mapped to SDR for review.'}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    frames = list(pool.map(extract, times))
font = ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf', 18)
for start in range(0, len(frames), 15):
    batch = frames[start:start+15]
    sheet = Image.new('RGB', (1100, 3*420), '#17231e')
    draw = ImageDraw.Draw(sheet)
    for j, frame in enumerate(batch):
        im = Image.open(out / frame['frame']); im.thumbnail((216, 384))
        x = (j%5)*220 + (220-im.width)//2; y = (j//5)*420
        sheet.paste(im, (x, y+28)); draw.text((x+5,y+4), frame['timecode'], font=font, fill='white')
    sheet.save(out / f'contact-{start//15+1:02d}.jpg', quality=90)
manifest = {'source_file': source.name, 'sha256': hashlib.file_digest(source.open('rb'),'sha256').hexdigest(), 'duration_seconds':duration, 'frame_count':len(frames), 'processing_seconds':round(time.time()-started,2), 'metadata':probe['format']['tags'], 'frames':frames}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps({k:manifest[k] for k in ['duration_seconds','frame_count','processing_seconds']}))
