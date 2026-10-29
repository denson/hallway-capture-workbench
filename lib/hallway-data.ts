/** Blueprint calibration: 150 pixels = 24 ft. Y up; +X right, +Z down the plan.
 * Local origin is blueprint pixel (288,335). Second-floor differences are provisional.
 */
export type ViewMode = 'orbit' | 'walk' | 'plan' | 'edit';
export const METRES_PER_PLAN_PIXEL = 24 * 0.3048 / 150;
export const planX = (pixel: number) => (pixel - 288) * METRES_PER_PLAN_PIXEL;
export const planZ = (pixel: number) => (pixel - 335) * METRES_PER_PLAN_PIXEL;
export const HALL = {
  length: planX(935), width: planZ(368),
  branchLeft: planX(464), branchRight: planX(495), branchEnd: planZ(594),
  lobbyLeft: planX(912), lobbyRight: planX(1063), lobbyEnd: planZ(396),
  ceiling: 138 * 0.0254, doorHeight: 79 * 0.0254, doorWidth: 34 * 0.0254,
  eyeHeight: 1.65, door210: planX(522),
} as const;
// Video IMG_3462 00:06–00:24 places 210 on the branch's east wall near Stair 2.
// Position along that wall is inferred from the walkthrough, not tape measured.
export const DOOR_210 = { x: HALL.branchRight + .08, z: HALL.branchEnd - 2, rotation: Math.PI / 2 } as const;
// Start just inside Stair 2, facing away from it toward the corridor junction.
export const WALK_START = {
  x: (HALL.branchLeft + HALL.branchRight) / 2,
  z: HALL.branchEnd - .6,
  yaw: 0,
  pitch: .05,
} as const;
export const FLOOR_RECTS = [
  [0, 0, HALL.length, HALL.width],
  [HALL.branchLeft, HALL.width, HALL.branchRight-HALL.branchLeft, HALL.branchEnd-HALL.width],
  [HALL.lobbyLeft, HALL.width, HALL.lobbyRight-HALL.lobbyLeft, HALL.lobbyEnd-HALL.width],
] as const;
export const rooms = [
  {id:'door210',name:'Outside apartment 210',short:'210',x:WALK_START.x,z:DOOR_210.z,yaw:-Math.PI/2,rect:[HALL.branchLeft,DOOR_210.z-.7,HALL.branchRight-HALL.branchLeft,1.4]},
  {id:'junction',name:'Main corridor junction',short:'Junction',x:(HALL.branchLeft+HALL.branchRight)/2,z:HALL.width/2,yaw:Math.PI,rect:[HALL.branchLeft,0,HALL.branchRight-HALL.branchLeft,HALL.width]},
  {id:'services',name:'Exposed services bay',short:'Services',x:(HALL.branchLeft+HALL.branchRight)/2,z:4.1,yaw:Math.PI,pitch:.9,rect:[HALL.branchLeft,2,HALL.branchRight-HALL.branchLeft,3]},
  {id:'stair2',name:'Back to Stair 2 · start',short:'Stair 2',...WALK_START,rect:[HALL.branchLeft,8,HALL.branchRight-HALL.branchLeft,HALL.branchEnd-8]},
  {id:'west',name:'West corridor · overview only',short:'Details not captured',x:3.8,z:HALL.width/2,yaw:-Math.PI/2,rect:[0,0,HALL.branchLeft,HALL.width]},
  {id:'east',name:'East corridor · overview only',short:'Details not captured',x:22,z:HALL.width/2,yaw:-Math.PI/2,rect:[15,0,12,HALL.width]},
  {id:'stair1',name:'Elevator / Stair 1 lobby · plan only',short:'Details not captured',x:34.5,z:2.25,yaw:Math.PI/2,rect:[HALL.lobbyLeft,HALL.width,HALL.lobbyRight-HALL.lobbyLeft,HALL.lobbyEnd-HALL.width]},
] as const;
export function hasDetailedCoverage(x:number,z:number){return x>=HALL.branchLeft&&x<=HALL.branchRight&&z>=0&&z<=HALL.branchEnd;}
export type Obstacle = {minX:number;maxX:number;minZ:number;maxZ:number};
export function onModeledFloor(x:number,z:number){
  return FLOOR_RECTS.some(([a,b,w,d])=>x>=a&&x<=a+w&&z>=b&&z<=b+d);
}
export function canOccupy(x:number,z:number,obstacles:Obstacle[],radius=.18){
  if(!Number.isFinite(x)||!Number.isFinite(z))return false;
  // Test the floor union so the T-junction remains open.
  for(const [dx,dz] of [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],
    [radius*.707,radius*.707],[-radius*.707,radius*.707],[radius*.707,-radius*.707],[-radius*.707,-radius*.707]]){
    if(!onModeledFloor(x+dx,z+dz))return false;
  }
  return !obstacles.some(b=>x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ);
}
export const refinementTasks = [
  {id:'R1',place:'Hallway sprinkler head / accessible apartment reference',request:'If convenient, provide a sharp still of visible markings and one wider reference image. Apartment-head identification stays separate from the hallway match.',reason:'Exact manufacturer/model/part number remain unknown. The hallway status is Needs confirmation for hallway.',kind:'Targeted detail · optional'},
  {id:'R2',place:'Pull station, heater and emergency lighting labels',request:'Only if an accessible label is readable: a close-up of its manufacturer/model information. No fixture measurements required for this revision.',reason:'Video establishes form and location; exact replacement identifiers are not confirmed.',kind:'Readable labels · later detail'},
  {id:'R3',place:'Stairwell side of Stairway 2',request:'If you recorded a separate stairwell-side 360, provide that file. No need to repeat the captured hallway.',reason:'The reviewed video shows the stair door from the hallway and views through its glass; it does not establish the full stairwell geometry.',kind:'Existing additional footage · if available'},
] as const;
