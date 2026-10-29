import type { Layout } from './layout-state';
import { HALL, DOOR_210 } from './hallway-data.ts';
import { hallwayComponentRecord } from './hallway-component-defaults.ts';

/** Update only unchanged old defaults; preserve user-positioned objects and finishes. */
export function migrateHallwayLayout(layout: Layout): Layout {
  const result = { ...layout };
  const changes = [
    { id: 'door-210', x: HALL.door210, oldZ: HALL.width + .08, z: -.08, angle: 180 },
    { id: 'frame-210', x: HALL.door210, oldZ: HALL.width + .08, z: -.08, angle: 180 },
    { id: 'wall-cabinet', x: HALL.door210 + 1.05, oldZ: HALL.width - .025, z: -.025, angle: 180 },
    { id: 'outlet-opposite-210', x: HALL.door210, oldZ: -.09175, z: HALL.width - .012, angle: 0 },
  ];
  for (const c of changes) {
    const p = layout[c.id];
    if (p && Math.abs(p.x - c.x) < 1e-6 && Math.abs(p.z - c.oldZ) < 1e-6 && Math.abs(p.angle) < 1e-6) {
      result[c.id] = { ...p, z: c.z, angle: c.angle };
    }
  }
  // Draft 2: video establishes that these objects belong in the stair branch.
  const videoChanges = [
    {id:'door-210',oldX:HALL.door210,oldZ:-.08,oldAngle:180,x:DOOR_210.x,z:DOOR_210.z,angle:90},
    {id:'frame-210',oldX:HALL.door210,oldZ:-.08,oldAngle:180,x:DOOR_210.x,z:DOOR_210.z,angle:90},
    {id:'wall-cabinet',oldX:HALL.door210+1.05,oldZ:-.025,oldAngle:180,x:HALL.branchRight+.025,z:DOOR_210.z+1.05,angle:90},
    {id:'outlet-opposite-210',oldX:HALL.door210,oldZ:HALL.width-.012,oldAngle:0,x:HALL.branchLeft+.006,z:DOOR_210.z,angle:-90},
    {id:'camera-dome',oldX:HALL.branchLeft+.08075,oldZ:2.65,oldAngle:0,x:(HALL.branchLeft+HALL.branchRight)/2,z:.025,angle:0},
  ];
  for(const c of videoChanges){const p=result[c.id];if(p&&Math.abs(p.x-c.oldX)<1e-5&&Math.abs(p.z-c.oldZ)<1e-5&&Math.abs(p.angle-c.oldAngle)<1e-5){result[c.id]={...p,x:c.x,z:c.z,angle:c.angle,...(c.id==='camera-dome'&&(p.y??0)===0?{y:HALL.ceiling-.20}:{})};}}
  for(const [i,z] of [3.9,7.1,10.3].entries()){
    const id='sprinkler-head-B'+i,p=result[id];
    if(p&&Math.abs(p.x-(HALL.branchLeft+.30))<1e-5&&Math.abs(p.z-z)<1e-5){result[id]={...p,x:HALL.branchRight-.17,z:z+.14,...(p.name==='Sprinkler head B'+(i+1)?{name:'Upright sprinkler head B'+(i+1)}:{})};}
  }
  for(const [id,z] of [['wall-heater-stair2',HALL.branchEnd-.44],['fire-pull-station',HALL.branchEnd-.34]] as const){const p=result[id];if(p&&Math.abs(p.z-(HALL.branchEnd-.62))<1e-5&&Math.abs(p.angle-90)<1e-5)result[id]={...p,z};}
  const cabinet=result['wall-cabinet'];
  if(cabinet){
    const oldNotes='White glazed cabinet beside 210, toward Stair 2. Contents and exact model not confirmed.';
    const previousPhotoNotes='Equipment type confirmed by user and close-ups: fire extinguisher in a white cabinet. Narrow left viewing window, left metal pull, right hinge, red body, black hose and ABC marking visible. Exact manufacturer/model/part number and dimensions unknown. Location disputed by user; prior placement retained pending their check.';
    const oldRecord=cabinet.record;
    result['wall-cabinet']={...cabinet,
      ...(['White wall cabinet beside 210','Fire extinguisher cabinet · location pending'].includes(cabinet.name??'')?{name:'Fire extinguisher cabinet'}:{}),
      ...(oldRecord&&((oldRecord.notes===oldNotes&&oldRecord.status==='unknown')||(oldRecord.notes===previousPhotoNotes&&oldRecord.status==='tentative'))&&!oldRecord.manufacturer&&!oldRecord.model&&!oldRecord.partNumber?{record:{...oldRecord,...hallwayComponentRecord('wall-cabinet'),workHeight:oldRecord.workHeight,heightStatus:oldRecord.heightStatus,heightSource:oldRecord.heightSource,accessNote:oldRecord.accessNote}}:{})};
  }
  const door=result['door-210'];
  const previousDoorNotes='Door height supplied by tape: 79 inches. Video places doorway on east wall near Stair 2. Distance along hallway estimated.';
  if(door?.record?.notes===previousDoorNotes){
    const latest=hallwayComponentRecord('door-210');
    result['door-210']={...door,record:{...door.record,notes:latest.notes,evidenceIds:[...new Set([...door.record.evidenceIds,...latest.evidenceIds])].slice(0,12)}};
  }
  const previousDoorRecords={
    'door-2':'Stair 2 sign and door/push hardware visible. Stairwell beyond is not modeled from this footage.',
    'door-209':'209 plaque readable at 01:00 near Stair 2 on the opposite wall from 210; longitudinal placement estimated.',
    'frame-209':'209 plaque readable at 01:00 near Stair 2 on the opposite wall from 210; longitudinal placement estimated.',
  };
  for(const [id,notes] of Object.entries(previousDoorRecords)){
    const placement=result[id];
    if(placement?.record?.notes===notes){const latest=hallwayComponentRecord(id);result[id]={...placement,record:{...placement.record,notes:latest.notes,evidenceIds:[...new Set([...placement.record.evidenceIds,...latest.evidenceIds])].slice(0,12)}};}
  }
  const stair=result['door-2'];
  const priorStairNotes='Hallway-facing Stairway 2 door: horizontal metal push bar across the leaf, with a larger latch-side housing at the left when viewed from the hall. Replaces the incorrect generic apartment lever. Hardware form follows video 00:54 and the 00:18 context frame; size, mounting height and projection remain estimated. Manufacturer/model/part number unconfirmed. Stairwell beyond is not modeled from this footage.';
  if(stair?.record?.notes===priorStairNotes){const latest=hallwayComponentRecord('door-2');result['door-2']={...stair,record:{...stair.record,notes:latest.notes,evidenceNote:latest.evidenceNote,evidenceIds:[...new Set([...stair.record.evidenceIds,...latest.evidenceIds])].slice(0,12)}};}
  const outlet=result['outlet-opposite-210'];
  if(outlet?.record&&outlet.record.notes===''&&outlet.record.evidenceIds.length===0){const latest=hallwayComponentRecord('outlet-opposite-210');result['outlet-opposite-210']={...outlet,record:{...outlet.record,notes:latest.notes,evidenceNote:latest.evidenceNote,evidenceIds:latest.evidenceIds}};}
  const priorPaperNotes='Hallway-facing Stairway 2 exit device (push bar), refined from four detail photos received 2026-10-29. Front view establishes the tall rounded latch case on hallway-view left, a broad press pad over roughly the left two-thirds of the horizontal rail, and a shorter fixed cover toward the right hinge end. Side views establish the curved projecting latch case, frame strike plate, backing rail, raised press pad, seam, small fixed-cover opening and compact right end cap. Replaces the earlier simplified full-width bar and block housings. Provisional dimensions: about 0.90 m overall width, 1.02 m center height and up to 0.11 m projection from the leaf; none tape-measured. No readable maker or model marking in these photos; manufacturer/model/part number and internal operation remain unknown. This is a visual reconstruction, not a functional or compliance assessment. Stairwell beyond remains unmodeled.';
  const paperDoor=result['door-2'];
  if(paperDoor?.record?.notes===priorPaperNotes){const latest=hallwayComponentRecord('door-2');result['door-2']={...paperDoor,record:{...paperDoor.record,notes:latest.notes,evidenceIds:[...new Set([...paperDoor.record.evidenceIds,...latest.evidenceIds])].slice(0,12)}};}
  return result;
}
