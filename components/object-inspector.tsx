import { useEffect, useRef } from 'react';
import type { EditorState } from '@/lib/house-editor';
import {
  emptyComponentRecord,
  identificationLabels,
} from '@/lib/component-record';
import { findEvidence, evidenceCaption } from '@/lib/video-evidence';
import { evidenceUrl } from '@/lib/evidence-url';
export function ObjectInspector({
  selected,
  onClose,
  onEdit,
}: {
  selected: NonNullable<EditorState['selected']>;
  onClose: () => void;
  onEdit: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const r = selected.record ?? emptyComponentRecord();
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    return () => el.close();
  }, []);
  const links = [
    ...new Set(
      (r.notes + ' ' + r.evidenceNote).match(/https?:\/\/[^\s<>"']+/g) ?? [],
    ),
  ]
    .flatMap((s) => {
      try {
        return [new URL(s.replace(/[.,;)]+$/, ''))];
      } catch {
        return [];
      }
    })
    .slice(0, 6);
  return (
    <dialog
      ref={dialog}
      className="object-inspector"
      aria-labelledby="inspection-title"
      onCancel={onClose}
    >
      <header>
        <div>
          <small>Component details</small>
          <h2 id="inspection-title">{selected.name}</h2>
        </div>
        <button
          autoFocus
          type="button"
          aria-label="Close component details"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <p className="record-status">{identificationLabels[r.status]}</p>
      <dl>
        {[
          ['Manufacturer', r.manufacturer || 'Unknown'],
          ['Model', r.model || 'Unknown'],
          ['Part number', r.partNumber || 'Unknown'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {r.notes && <p>{r.notes}</p>}
      {selected.evidence && (
        <section>
          <h3>Model evidence</h3>
          <p>
            {selected.evidence.basis} · {selected.evidence.status}
          </p>
          <p>{selected.evidence.notes}</p>
        </section>
      )}
      <section>
        <h3>Model dimensions</h3>
        <p>
          {selected.dimensions.width.toFixed(3)} m wide ×{' '}
          {selected.dimensions.depth.toFixed(3)} m deep ×{' '}
          {selected.dimensions.height.toFixed(3)} m high
        </p>
        <small>
          Full assembly bounds; estimates unless explicitly measured.
        </small>
      </section>
      {r.workHeight !== null && (
        <p>
          Work-point height: {r.workHeight.toFixed(2)} m · {r.heightStatus}
        </p>
      )}
      {!!r.evidenceIds.length && (
        <section>
          <h3>Reference images</h3>
          <div className="inspection-images">
            {r.evidenceIds.map((id) => {
              const e = findEvidence(id);
              return e ? (
                <a
                  key={id}
                  href={evidenceUrl(id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={evidenceUrl(id)} alt={evidenceCaption(e)} />
                  <span>{evidenceCaption(e)}</span>
                </a>
              ) : null;
            })}
          </div>
        </section>
      )}
      {r.evidenceNote && <p>{r.evidenceNote}</p>}
      {!!links.length && (
        <section>
          <h3>External references</h3>
          {links.map((url, i) => (
            <p key={url.href}>
              <a href={url.href} target="_blank" rel="noreferrer">
                Open reference {i + 1} · {url.hostname}
              </a>
            </p>
          ))}
        </section>
      )}
      <footer>
        <button type="button" onClick={onEdit}>
          Edit this component’s record
        </button>
        <button type="button" onClick={onClose}>
          Back to exploring
        </button>
      </footer>
    </dialog>
  );
}
