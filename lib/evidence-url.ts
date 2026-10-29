/** Static assets work at both a domain root and a GitHub Pages project subpath. */
export function evidenceUrl(id:string){
  const base=typeof document==='undefined'?'http://localhost/':document.baseURI;
  return new URL(`evidence/${encodeURIComponent(id)}.jpg`,base).pathname;
}
