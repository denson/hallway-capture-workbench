'use client';
import {emptyComponentRecord,identificationLabels,identificationStatuses,type ComponentRecord} from '@/lib/component-record';
import {allEvidence,findEvidence,evidenceCaption} from '@/lib/video-evidence';
import {Input} from '@/components/ui/input';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import {Button} from '@/components/ui/button';
import {evidenceUrl} from '@/lib/evidence-url';

export function ComponentDetails({record,onChange}:{record?:ComponentRecord;onChange:(patch:Partial<ComponentRecord>)=>void}){
  const r=record??emptyComponentRecord();
  const field=(key:'manufacturer'|'model'|'partNumber'|'evidenceNote'|'heightSource',label:string,max=120)=><label className="editor-field" key={key}>{label}<Input aria-label={label} key={key+r[key]} defaultValue={r[key]} maxLength={max} placeholder="Unknown" onBlur={e=>{if(e.target.value!==r[key])onChange({[key]:e.target.value});}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></label>;
  return <details className="component-details" open>
    <summary>Component record</summary>
    <p className="record-status">{identificationLabels[r.status]}</p>
    <label className="editor-field">Identification status<NativeSelect aria-label="Identification status" value={r.status} onChange={e=>onChange({status:e.target.value as ComponentRecord['status']})}>{identificationStatuses.map(s=><NativeSelectOption key={s} value={s}>{identificationLabels[s]}</NativeSelectOption>)}</NativeSelect></label>
    {field('manufacturer','Manufacturer')}{field('model','Model')}{field('partNumber','Part number',160)}
    <label className="editor-field">Identification notes<textarea aria-label="Identification notes" key={'notes'+r.notes} defaultValue={r.notes} maxLength={4000} rows={4} onBlur={e=>{if(e.target.value!==r.notes)onChange({notes:e.target.value});}}/></label>
    <h4>Evidence</h4>
    <p className="editor-help">Selected reference photos and timestamped IMG_3462.MOV review frames included with this demo.</p>
    <div className="evidence-grid">{r.evidenceIds.map(id=>{const e=findEvidence(id);return e?<figure key={id}><a href={evidenceUrl(id)} target="_blank" rel="noreferrer"><img src={evidenceUrl(id)} alt={evidenceCaption(e)} loading="lazy"/><figcaption>{evidenceCaption(e)}</figcaption></a><button type="button" aria-label={'Remove evidence '+evidenceCaption(e)} onClick={()=>onChange({evidenceIds:r.evidenceIds.filter(v=>v!==id)})}>Remove reference</button></figure>:<p key={id}>Unavailable reference: {id}</p>;})}</div>
    <label className="editor-field">Attach evidence reference<NativeSelect aria-label="Attach evidence reference" value="" onChange={e=>{if(e.target.value&&!r.evidenceIds.includes(e.target.value)&&r.evidenceIds.length<12)onChange({evidenceIds:[...r.evidenceIds,e.target.value]});}}><NativeSelectOption value="">Choose a photo or timestamp…</NativeSelectOption>{allEvidence.filter(e=>!r.evidenceIds.includes(e.id)).map(e=><NativeSelectOption key={e.id} value={e.id}>{evidenceCaption(e)}</NativeSelectOption>)}</NativeSelect></label>
    {field('evidenceNote','Additional evidence reference',1000)}
    <h4>Access planning</h4>
    <label className="editor-field">Work-point height above floor (m)<Input aria-label="Work-point height above floor in metres" key={'height'+r.workHeight} type="number" min={0} max={30} step={.01} defaultValue={r.workHeight??''} placeholder="Unknown" onBlur={e=>{const value=e.target.value.trim()===''?null:Number(e.target.value);if(value!==r.workHeight)onChange({workHeight:value});}}/></label>
    {r.workHeight!==null&&<p className="editor-help">{(r.workHeight/.3048).toFixed(2)} ft · {r.heightStatus}</p>}
    <label className="editor-field">Height basis<NativeSelect aria-label="Height basis" value={r.heightStatus} onChange={e=>onChange({heightStatus:e.target.value as ComponentRecord['heightStatus']})}>{['unknown','estimated','measured'].map(s=><NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>)}</NativeSelect></label>
    {field('heightSource','Height source',1000)}
    <label className="editor-field">Access notes<textarea aria-label="Access notes" key={'access'+r.accessNote} defaultValue={r.accessNote} maxLength={2000} rows={3} onBlur={e=>{if(e.target.value!==r.accessNote)onChange({accessNote:e.target.value});}}/></label>
    <p className="editor-help">Height describes the service point, not ladder length. Save arrangement to retain changes; Save project backs up the records.</p>
    <Button type="button" variant="ghost" onClick={()=>onChange(emptyComponentRecord())}>Clear component record</Button>
  </details>;
}
