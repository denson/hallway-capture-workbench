import importlib.util,json,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('refresh',Path(__file__).resolve().parents[1]/'scripts/refresh-sources.py')
refresh=importlib.util.module_from_spec(spec);spec.loader.exec_module(refresh)
SOURCE={'id':'example','title':'Example','url':'https://example.test/reference','role':'test'}
class Response:
    def __init__(self,text='',status=200):self.text=text;self.content=text.encode();self.status_code=status;self.headers={'ETag':'"version-a"'}
    def raise_for_status(self):
        if self.status_code>=400:raise RuntimeError('HTTP '+str(self.status_code))
class SourceRefreshTests(unittest.TestCase):
    def test_scripts_and_navigation_do_not_become_knowledge_or_false_changes(self):
        a='<main><h1>Equipment</h1><p>Observed details.</p><script>runDangerousCommand()</script><nav>Menu</nav></main>'
        b=a.replace('runDangerousCommand()','completelyDifferentScript()')
        self.assertEqual(refresh.extract_markdown(a),refresh.extract_markdown(b));self.assertNotIn('Menu',refresh.extract_markdown(a));self.assertIn('# Equipment',refresh.extract_markdown(a))
    def test_changed_pages_keep_old_versions_and_require_review(self):
        with tempfile.TemporaryDirectory() as folder:
            cache=Path(folder);manifest={'sources':[SOURCE]}
            first=refresh.refresh(manifest,{},cache,lambda *a,**k:Response('<article><p>'+'First visible observation. '*12+'</p></article>'))
            old=first['sources'][0];old['reviewed_sha256']=old['content_sha256'];old['review_needed']=False
            second=refresh.refresh(manifest,first,cache,lambda *a,**k:Response('<article><p>'+'Revised visible observation. '*12+'</p></article>'))
            row=second['sources'][0];self.assertEqual(row['status'],'changed');self.assertTrue(row['review_needed']);self.assertEqual(len(list((cache/'example/versions').glob('*.md'))),2);self.assertTrue((cache/'example/changes.diff').exists())
    def test_not_modified_preserves_content_and_pending_review(self):
        old={**SOURCE,'content_sha256':'abc','etag':'"etag"','fetched_at':'earlier','review_needed':True}
        def fetch(url,headers,timeout):
            self.assertEqual(headers['If-None-Match'],'"etag"');return Response(status=304)
        with tempfile.TemporaryDirectory() as folder:
            row=refresh.refresh({'sources':[SOURCE]},{'sources':[old]},Path(folder),fetch)['sources'][0]
        self.assertEqual(row['content_sha256'],'abc');self.assertEqual(row['fetched_at'],'earlier');self.assertTrue(row['review_needed'])
    def test_unavailable_page_does_not_replace_previous_evidence(self):
        old={**SOURCE,'content_sha256':'previous','fetched_at':'earlier','reviewed_sha256':'previous'}
        with tempfile.TemporaryDirectory() as folder:
            row=refresh.refresh({'sources':[SOURCE]},{'sources':[old]},Path(folder),lambda *a,**k:Response(status=403))['sources'][0]
        self.assertEqual(row['status'],'unavailable');self.assertEqual(row['content_sha256'],'previous');self.assertEqual(row['fetched_at'],'earlier')
    def test_optional_human_reference_is_never_fetched(self):
        def forbidden(*a,**k):raise AssertionError('Do not fetch human-only references')
        with tempfile.TemporaryDirectory() as folder:
            row=refresh.refresh({'sources':[{**SOURCE,'capture':False}]},{},Path(folder),forbidden)['sources'][0]
        self.assertEqual(row['status'],'human-reference');self.assertIsNone(row['checked_at'])
    def test_every_registered_page_has_a_publishable_review_note(self):
        root=Path(__file__).resolve().parents[1];manifest=json.loads((root/'knowledge/source-manifest.json').read_text())
        for source in manifest['sources']:
            text=(root/'knowledge/source-notes'/(source['id']+'.md')).read_text(encoding='utf-8')
            self.assertIn(source['url'],text)
if __name__=='__main__':unittest.main()
