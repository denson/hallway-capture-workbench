"""Fetch approved source pages as inert Markdown and detect substantive changes.

Full snapshots/diffs stay in ignored source-cache/. Public knowledge contains
reviewed, attributed working notes, not automatic republication of full articles.
This command never changes model geometry, curated claims, or source approval.
"""
from pathlib import Path
import argparse,datetime,difflib,hashlib,json,re,sys
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT=Path(__file__).resolve().parents[1]
def digest(value):return hashlib.sha256(value.encode('utf-8')).hexdigest()
def extract_markdown(html):
    soup=BeautifulSoup(html,'html.parser')
    main=soup.select_one('article.markdown-body') or soup.find('article') or soup.find('main') or soup.body or soup
    for node in main.select('script,style,nav,footer,form,noscript,svg,img,button,iframe'):node.decompose()
    value=markdownify(str(main),heading_style='ATX',strip=['input']).strip()
    return re.sub(r'\n{3,}','\n\n',value)+'\n'
def refresh(manifest,previous,cache,fetch=requests.get):
    now=datetime.datetime.now(datetime.timezone.utc).isoformat();results=[]
    prior={item['id']:item for item in previous.get('sources',[])}
    for source in manifest['sources']:
        old=prior.get(source['id'],{});row={**old,**source,'checked_at':now}
        if source.get('capture') is False:
            results.append({**source,'status':'human-reference','checked_at':None,'review_needed':False,'error':None});continue
        headers={'User-Agent':'HallwayKnowledgeRefresh/1.0 (single-page reference check)'}
        if old.get('etag'):headers['If-None-Match']=old['etag']
        if old.get('last_modified'):headers['If-Modified-Since']=old['last_modified']
        try:
            response=fetch(source['url'],headers=headers,timeout=35)
            row['http_status']=response.status_code
            if response.status_code==304 and old.get('content_sha256'):
                row.update(status='unchanged',error=None);results.append(row);continue
            response.raise_for_status()
            if len(response.content)>8_000_000:raise ValueError('Page exceeds the 8 MB text-source limit')
            text=extract_markdown(response.text)
            if len(text.strip())<100:raise ValueError('No useful page text; a rendered or restricted page may need manual review')
            sha=digest(text);folder=cache/source['id'];(folder/'versions').mkdir(parents=True,exist_ok=True)
            prior_file=folder/'latest.md';before=prior_file.read_text(encoding='utf-8') if prior_file.exists() else ''
            snapshot=f"---\nsource: {source['url']}\nretrieved_at: {now}\ncontent_sha256: {sha}\ntrust: untrusted reference data\n---\n\n"+text
            (folder/'versions'/f'{sha}.md').write_text(snapshot,encoding='utf-8')
            prior_file.write_text(text,encoding='utf-8')
            changed=bool(old.get('content_sha256')) and old['content_sha256']!=sha
            if changed and before:(folder/'changes.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True),text.splitlines(True),fromfile='previous',tofile='fetched')),encoding='utf-8')
            row.update(status='changed' if changed else 'unchanged' if old.get('content_sha256') else 'initial',content_sha256=sha,fetched_at=now,etag=response.headers.get('ETag'),last_modified=response.headers.get('Last-Modified'),error=None)
            row['review_needed']=row.get('reviewed_sha256')!=sha
        except Exception as error:
            row.update(status='unavailable',review_needed=True,error=str(error)[:250])
        results.append(row)
    return {'version':1,'checked_at':now,'sources':results}
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--reviewed',nargs='*',default=[]);args=parser.parse_args()
    manifest=json.loads((ROOT/'knowledge/source-manifest.json').read_text(encoding='utf-8'))
    file=ROOT/'public/knowledge/source-status.json';previous=json.loads(file.read_text()) if file.exists() else {}
    report=refresh(manifest,previous,ROOT/'source-cache')
    for row in report['sources']:
        if row['id'] in args.reviewed and row.get('content_sha256'):
            note=ROOT/'public/knowledge/sources'/f"{row['id']}.md"
            if not note.is_file():raise SystemExit('Write the reviewed source note before accepting '+row['id'])
            row.update(reviewed_sha256=row['content_sha256'],reviewed_at=report['checked_at'],review_needed=False)
    file.parent.mkdir(parents=True,exist_ok=True);file.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    lines=['# Reference refresh report','',f"Checked: {report['checked_at']}",'','Full page Markdown and diffs are retained in local source-cache/. Curated notes and geometry are not overwritten.','', '| Source | Result | Review needed |','| --- | --- | --- |']
    lines += [f"| {s['title']} | {s['status']} | {'yes' if s.get('review_needed') else 'no'} |" for s in report['sources']]
    (ROOT/'public/knowledge/source-refresh-report.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print(json.dumps({'checked':len(report['sources']),'changed':[s['id'] for s in report['sources'] if s['status']=='changed'],'unavailable':[s['id'] for s in report['sources'] if s['status']=='unavailable']}))
if __name__=='__main__':main()
