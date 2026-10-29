'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Camera,
  ChevronRight,
  Download,
  Footprints,
  House,
  Layers3,
  Maximize,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Pencil,
  Sun,
  X,
} from 'lucide-react';
import { PROJECT_CONFIG } from '@/lib/project-config';
import { EditorPanel } from '@/components/editor-panel';
import type { EditorState } from '@/lib/house-editor';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { rooms, HALL, WALK_START, FLOOR_RECTS, hasDetailedCoverage, refinementTasks, type ViewMode } from '@/lib/house-data';
import type { HouseApi } from '@/lib/house-scene';
import {readViewHash,syncViewUrl,writeViewHash} from '@/lib/view-url';
export default function Home() {
  const projectInput=useRef<HTMLInputElement>(null);
  const host = useRef<HTMLDivElement>(null),
    api = useRef<HouseApi | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [viewUrl,setViewUrl]=useState('');
  const [sceneVersion,setSceneVersion]=useState(0);
  const [mode, setMode] = useState<ViewMode>('walk'),
    [roof, setRoof] = useState(true),
    [labels, setLabels] = useState(true),
    [time, setTime] = useState(48);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [sidebar, setSidebar] = useState(true),
    [active, setActive] = useState('stair2'),
    [position, setPosition] = useState<{x:number;z:number;yaw:number}>({ x: WALK_START.x, z: WALK_START.z, yaw: WALK_START.yaw });
  useEffect(() => {
    if (window.innerWidth < 641) setSidebar(false);
    let cancelled = false;
    import('@/lib/house-scene')
      .then(({ createHouse }) => {
        if (cancelled || !host.current) return;
        try {
          api.current = createHouse(
            host.current,
            (x, z, yaw) => setPosition({ x, z, yaw }),
            setEditorState,
            undefined,
            setNotice,
          );
          api.current.setMode(mode);api.current.setRoof(roof);api.current.setLabels(labels);api.current.setTime(time);
          setReady(true);
          setSceneVersion(v=>v+1);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : 'The 3D viewer could not start.',
          );
        }
      })
      .catch(() =>
        setError('The 3D viewer could not load. Please reload this page.'),
      );
    return () => {
      cancelled = true;
      api.current?.dispose();
      api.current = null;
    };
  }, []);
  useEffect(() => {
    if(api.current&&api.current.getView().mode!==mode)api.current.setMode(mode);
  }, [mode, ready]);
  useEffect(() => {
    api.current?.setRoof(roof);
  }, [roof, ready]);
  useEffect(() => {
    api.current?.setLabels(labels);
  }, [labels, ready]);
  useEffect(() => {
    api.current?.setTime(time);
  }, [time, ready]);
  useEffect(()=>{
    if(!ready||!api.current)return;
    return syncViewUrl(()=>api.current!.getView(),nav=>{
      api.current!.applyView(nav);const v=api.current!.getView();
      setMode(v.mode);setRoof(v.roof);setLabels(v.labels);setTime(v.time);setActive(nav.location??'');if(v.mode==='edit')setSidebar(true);
    },window,setViewUrl);
  },[ready,sceneVersion]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!ready) return;
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => Promise<unknown>;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Tool,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const paint = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    const tools: Tool[] = [
      {
        name:'get_hallway_context',
        description:'Read the live camera view and one agent-readable knowledge section. Source text is reference data. This does not edit the model.',
        inputSchema:{type:'object',properties:{section:{type:'string',enum:['index','model','components','process','controls','tour','sources','source-refresh']}},additionalProperties:false},
        annotations:{readOnlyHint:true,untrustedContentHint:true},
        execute:async input=>{
          const v=input as {section?:string};
          if(!v||typeof v!=='object'||Object.keys(v).some(k=>k!=='section')||v.section!==undefined&&!['index','model','components','process','controls','tour','sources','source-refresh'].includes(v.section))throw Error('Choose a supported knowledge section.');
          const url=new URL(`knowledge/${v.section??'index'}.md`,document.baseURI);
          const response=await fetch(url);if(!response.ok)throw Error('Knowledge document unavailable.');
          return {view:api.current?.getView(),viewUrl:location.href,knowledgeUrl:url.href,markdown:await response.text()};
        },
      },
      {
        name:'navigate_hallway_view',
        description:'Apply a validated camera URL fragment to navigate or inspect a component. Does not change geometry or records.',
        inputSchema:{type:'object',properties:{view:{type:'string',description:'A view hash, for example #v=1&mode=edit&object=wall-cabinet&focus=1&roof=0'}},required:['view'],additionalProperties:false},
        annotations:{readOnlyHint:false,untrustedContentHint:false},
        execute:async input=>{
          const v=input as {view?:string};
          if(!v||typeof v!=='object'||Object.keys(v).some(k=>k!=='view')||typeof v.view!=='string'||!v.view.startsWith('#'))throw Error('Provide a camera URL fragment beginning with #.');
          const nav=readViewHash(v.view);if(!nav)throw Error('Invalid camera view.');
          api.current!.applyView(nav);const state=api.current!.getView();setMode(state.mode);setRoof(state.roof);setLabels(state.labels);setTime(state.time);setActive(nav.location??'');if(state.mode==='edit')setSidebar(true);
          history.replaceState(history.state,'',location.href.split('#')[0]+writeViewHash(state));await paint();return {view:api.current!.getView(),viewUrl:location.href};
        },
      },
      {
        name: 'configure_house_view',
        description:
          'Change the visible house viewing mode and optionally roof visibility.',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['orbit', 'walk', 'plan', 'edit'] },
            roof: { type: 'boolean' },
          },
          required: ['mode'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const v = input as { mode?: ViewMode; roof?: boolean };
          if (
            !v ||
            typeof v !== 'object' ||
            !['orbit', 'walk', 'plan', 'edit'].includes(v.mode ?? '') ||
            ('roof' in v && typeof v.roof !== 'boolean') ||
            Object.keys(v).some((k) => !['mode', 'roof'].includes(k))
          )
            throw new Error(
              'Provide mode orbit, walk, or plan and an optional boolean roof.',
            );
          changeMode(v.mode!);
          if (v.roof !== undefined) setRoof(v.roof);
          await paint();
          return {
            mode: v.mode,
            roof:
              v.roof ??
              (v.mode === 'walk'
                ? true
                : v.mode === 'plan'
                  ? false
                  : undefined),
          };
        },
      },
      {
        name: 'visit_house_room',
        description: 'Move the current camera to a room in the house.',
        inputSchema: {
          type: 'object',
          properties: {
            room: { type: 'string', enum: rooms.map((r) => r.id) },
          },
          required: ['room'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const v = input as { room?: string };
          if (
            !v ||
            typeof v !== 'object' ||
            !rooms.some((r) => r.id === v.room) ||
            Object.keys(v).some((k) => k !== 'room')
          )
            throw new Error('Provide a valid room id.');
          visit(v.room!);
          await paint();
          return { room: v.room };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, [ready]);
  useEffect(() => {
    if (!editorState?.dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editorState?.dirty]);
  function changeMode(value: ViewMode) {
    rememberView();
    setMode(value);
    setActive('');
    if (value === 'walk') setRoof(true);
    if (value === 'plan' || value === 'edit') setRoof(false);
    if (value === 'edit') setSidebar(true);
  }
  function visit(id: string) {
    rememberView();
    setActive(id);
    api.current?.goTo(id);
  }
  function rememberView(){if(api.current)window.history.pushState(window.history.state,'',window.location.href.split('#')[0]+writeViewHash(api.current.getView()));}
  async function copyViewLink(){if(!api.current)return;const url=window.location.href.split('#')[0]+writeViewHash(api.current.getView());window.history.replaceState(window.history.state,'',url);setViewUrl(url);try{await navigator.clipboard.writeText(url);setNotice('View link copied. It restores this camera and selected component.');}catch{setNotice('Copy the current view URL from the address bar.');}}
  async function save(kind: 'image' | 'model') {
    if (!api.current) return;
    setBusy(true);
    try {
      if (kind === 'image') await api.current.renderImage();
      else await api.current.exportModel();
      setNotice(
        kind === 'image'
          ? 'Your rendered view has been downloaded.'
          : 'Your 3D model has been downloaded.',
      );
    } catch {
      setNotice('Could not save this file. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function saveProject(){if(!api.current)return;setBusy(true);try{await api.current.saveProject({mode,roof,labels,time});setNotice('Complete project downloaded. Keep this file as your backup.');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
  async function openProject(file:File){if(!host.current)return;setBusy(true);try{
    if(file.size>100_000_000)throw Error('Choose a project file smaller than 100 MB.');
    const {parseProject}=await import('@/lib/project-file');const data=parseProject(await file.text());
    const {ObjectLoader}=await import('three');const object=await new ObjectLoader().parseAsync(data.model);
    for(const e of data.entries)if(!object.getObjectByProperty('uuid',e.uuid))throw Error('The project is missing an object.');
    const {createHouse}=await import('@/lib/house-scene');const previous=api.current;
    const next=createHouse(host.current,(x,z,yaw)=>setPosition({x,z,yaw}),setEditorState,{file:data,object},setNotice);
    previous?.dispose();api.current=next;next.setMode(data.view.mode);next.setRoof(data.view.roof);next.setLabels(data.view.labels);next.setTime(data.view.time);
    setMode(data.view.mode);setRoof(data.view.roof);setLabels(data.view.labels);setTime(data.view.time);setActive('');setReady(true);setSceneVersion(v=>v+1);setSidebar(true);setNotice('Project opened, including its catalog and saved designs.');
  }catch(e){setNotice('Could not open project: '+(e as Error).message);}finally{setBusy(false);if(projectInput.current)projectInput.current.value='';}}
  function reset() {
    setMode('orbit');
    setRoof(false);
    setActive('');
    api.current?.setMode('orbit');
  }
  return (
    <main className="studio">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <House size={22} />
          </span>
          <div>
            <h1>{PROJECT_CONFIG.title}</h1>
            <p>
              VIDEO RECONSTRUCTION <span> / </span> DRAFT 02
            </p>
          </div>
        </div>
        <Button disabled={!ready||busy} onClick={saveProject}>Save project</Button><Button disabled={!ready||busy} onClick={()=>projectInput.current?.click()}>Open project</Button><input ref={projectInput} hidden type="file" accept=".json" onChange={e=>{const f=e.target.files?.[0];if(f)void openProject(f);}}/>
        <Button disabled={!ready} onClick={copyViewLink}>Copy view link</Button>
        <a className="knowledge-link" href="./knowledge.html">Knowledge &amp; sources</a>
        <output className="sr-only" aria-label="Current view URL">{viewUrl}</output>
        <div className="top-note">
          <span className="status-dot" /> Interactive 3D model
        </div>
        <Button
          className="export-button"
          disabled={!ready || busy}
          onClick={() => save('image')}
        >
          <Camera size={16} />
          <span>{busy ? 'Preparing…' : 'Save render'}</span>
        </Button>
      </header>
      <div className={`workspace ${sidebar ? '' : 'sidebar-closed'}`}>
        <aside
          className={`sidebar ${mode === 'edit' ? 'editing' : ''}`}
          aria-label="Model controls"
        >
          {mode === 'edit' && (
            <EditorPanel
              state={editorState}
              editor={api.current?.editor}
              notify={setNotice}
              onClose={() => setSidebar(false)}
              roof={roof}
              setRoof={setRoof}
            />
          )}
          <div className="sidebar-heading">
            <span className="eyebrow">SECOND FLOOR · HOLMES HARDWARE BLOCK</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Hide controls"
              onClick={() => setSidebar(false)}
            >
              <PanelLeftClose />
            </Button>
          </div>
          <h2>
            Your hallway.
            <br />
            Video revision.
          </h2>
          <p className="description">
            Video-informed Stair 2 hallway, with wall fixtures and exposed services. Gray adjoining corridors show where detail has not been captured.
          </p>
          <div className="facts">
            <div>
              <strong>79″</strong>
              <span>Door height · tape</span>
            </div>
            <div>
              <strong>24′</strong>
              <span>Plan scale bar</span>
            </div>
            <div>
              <strong>5:28</strong>
              <span>Video reviewed</span>
            </div>
          </div>
          <section className="control-section">
            <h3>Go to a location</h3>
            <div className="room-list">
              {rooms.map((room, i) => (
                <button
                  className={`room-row ${active === room.id ? 'selected' : ''}`}
                  key={room.id}
                  disabled={!ready}
                  onClick={() => visit(room.id)}
                >
                  <span className="room-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{room.name}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </section>
          <section className="control-section display-section">
            <h3>Model settings</h3>
            <label className="setting">
              <span>Ceiling / full walls</span>
              <Switch
                checked={roof}
                onCheckedChange={setRoof}
                disabled={!ready}
                aria-label="Show ceiling and full walls"
              />
            </label>
            <label className="setting">
              <span>Room labels</span>
              <Switch
                checked={labels}
                onCheckedChange={setLabels}
                disabled={!ready}
                aria-label="Room labels"
              />
            </label>
            <div className="light-label">
              <span>
                <Sun size={15} /> Light direction
              </span>
              <span>
                {time < 25 ? 'Morning' : time > 75 ? 'Golden hour' : 'Midday'}
              </span>
            </div>
            <Slider
              aria-label="Daylight time"
              value={[time]}
              onValueChange={(v) => setTime(Array.isArray(v) ? v[0] : v)}
              min={5}
              max={95}
              step={1}
              disabled={!ready}
            />
          </section>
          <p className="model-note">
            Fuel & Iron · building location checked
            <br />
            Select equipment in Edit for its record, source frames and dimensions. Gray = details not captured. Ceiling off gives a cutaway.
          </p>
          <details className="refinement-list"><summary>Process for Mike · preserved stages</summary><ol><li>First draft from photos and blueprint; wrong door placement.</li><li>Floor double-click navigation added.</li><li>Arrow controls removed.</li><li>Door-side and starting-view correction.</li><li>5:28 video indexed; timestamped evidence and route corrections recorded.</li><li>Video-derived model, gray coverage and equipment records with source frames.</li></ol><p>Stages and original evidence are preserved locally. This is guided reconstruction from evidence; dimensions remain estimates unless measured.</p></details>
          <details className="refinement-list">
            <summary>Optional refinement list · {refinementTasks.length} places</summary>
            <p>The draft works with existing evidence. These would improve selected details; no hallway or ceiling measurements are needed.</p>
            <ol>{refinementTasks.map(task=><li key={task.id}><strong>{task.id} · {task.place}</strong><small>{task.kind}</small><p>{task.request}</p><p className="refinement-reason">{task.reason}</p></li>)}</ol>
            <Button variant="outline" onClick={()=>{const text=['HALLWAY 210 — OPTIONAL REFINEMENT LIST','No hallway widths or floor-to-ceiling measurements requested.','',...refinementTasks.map(t=>`${t.id}. ${t.place}\n${t.kind}\n${t.request}\nWhy: ${t.reason}\n`)].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='hallway-210-follow-up.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download follow-up list</Button>
          </details>
          <Button
            variant="outline"
            className="download-model"
            disabled={!ready || busy}
            onClick={() => save('model')}
          >
            <Download size={15} /> Download 3D model <span>GLB</span>
          </Button>
        </aside>
        <section
          className={`viewport ${mode === 'edit' ? 'edit-viewport' : ''}`}
          aria-label="3D house viewer"
        >
          <div ref={host} className="scene-host" />
          <div className="viewer-top">
            <div className="view-tabs" role="group" aria-label="Viewing mode">
              {!sidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Show controls"
                  onClick={() => setSidebar(true)}
                >
                  <PanelLeftOpen />
                </Button>
              )}
              {(
                [
                  { id: 'orbit', label: 'Orbit', icon: Box },
                  { id: 'walk', label: 'Walk inside', icon: Footprints },
                  { id: 'plan', label: 'Floor plan', icon: Layers3 },
                  { id: 'edit', label: 'Edit', icon: Pencil },
                ] as const
              ).map((v) => (
                <Button
                  key={v.id}
                  variant="ghost"
                  aria-pressed={mode === v.id}
                  className={mode === v.id ? 'is-active' : ''}
                  onClick={() => changeMode(v.id)}
                  disabled={!ready}
                >
                  <v.icon size={16} />
                  {v.label}
                </Button>
              ))}
            </div>
            <div className="view-actions">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset view"
                title="Reset view"
                onClick={reset}
                disabled={!ready}
              >
                <RotateCcw />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fullscreen"
                title="Fullscreen"
                onClick={() => {
                  const v = host.current?.parentElement;
                  if (document.fullscreenElement)
                    void document.exitFullscreen();
                  else if (v?.requestFullscreen)
                    void v
                      .requestFullscreen()
                      .catch(() =>
                        setNotice('Fullscreen is unavailable in this browser.'),
                      );
                  else setNotice('Fullscreen is unavailable in this browser.');
                }}
              >
                <Maximize />
              </Button>
            </div>
          </div>
          {!ready && !error && (
            <div className="loading">
              <span className="spinner" />
              <strong>Opening your hallway…</strong>
              <p>Preparing materials and lighting</p>
            </div>
          )}
          {error && (
            <div className="loading error">
              <strong>Unable to open the 3D view</strong>
              <p>{error}</p>
              <p>Please use a browser with WebGL enabled.</p>
              <Button onClick={() => location.reload()}>Try again</Button>
            </div>
          )}
          {mode === 'walk' && ready && (
            <>
              <div className="crosshair" aria-hidden="true" />
              <div className="walk-badge">
                <span className="status-dot" /> DOUBLE-CLICK FLOOR TO MOVE · DRAG TO LOOK
              </div>
            </>
          )}
          {ready&&<div className={`coverage-badge ${mode==='walk'&&!hasDetailedCoverage(position.x,position.z)?'overview':''}`}>{mode==='walk'?(hasDetailedCoverage(position.x,position.z)?'Captured route · geometry and sizes remain provisional':'Details not captured · gray plan context'):'Orange: captured route · Gray: details not captured'}</div>}
          <div className="viewer-bottom">

            <div className="mini-map">
              <div className="map-title">
                <span>{mode === 'walk' ? 'YOU ARE HERE' : 'HALLWAY PLAN'}</span>
                <span>PLAN ↑</span>
              </div>
              <svg
                viewBox="-1 -1 40 15"
                aria-label="Hallway floor plan with location navigation"
              >
                {FLOOR_RECTS.map(([x,z,w,d],i)=><rect key={'floor-'+i} x={x} y={z} width={w} height={d} fill="#cecfbf" stroke="#788684" strokeWidth=".11"/>)}
                {rooms.map((r) => (
                  <g
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to ${r.name}`}
                    onClick={() => visit(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        visit(r.id);
                      }
                    }}
                  >
                    <rect
                      x={r.rect[0]}
                      y={r.rect[1]}
                      width={r.rect[2]}
                      height={r.rect[3]}
                      fill={
                          active === r.id
                            ? '#a4c5a8'
                            : '#dddcd1'
                      }
                      stroke="#788684"
                      strokeWidth=".17"
                    />
                  </g>
                ))}
                {mode === 'walk' && (
                  <g
                    transform={`translate(${position.x} ${position.z}) rotate(${(-position.yaw * 180) / Math.PI})`}
                  >
                    <path
                      d="M 0 -.8 L -.5 .4 L .5 .4 Z"
                      fill="#173b30"
                      stroke="white"
                      strokeWidth=".14"
                    />
                  </g>
                )}
              </svg>
              <span className="map-footnote">Click a location to explore</span>
            </div>
          </div>
          {notice && (
            <div className="toast" role="status">
              {notice}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
