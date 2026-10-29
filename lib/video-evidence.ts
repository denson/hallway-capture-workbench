/** Approved reference IDs; selected metadata-free stills are served under evidence/. */
export const videoEvidence = [
  {id:'v006',seconds:6,title:'Apartment 210 door'},
  {id:'v009',seconds:9,title:'Apartment 210 door and plaque context'},
  {id:'v132',seconds:132,title:'Heater top and projecting enclosure'},
  {id:'v138',seconds:138,title:'Heater side and wall projection'},
  {id:'v162',seconds:162,title:'Continuous wall toward T; no mid-branch doorway'},
  {id:'v168',seconds:168,title:'Apartment 210 plaque on captured branch'},
  {id:'v018',seconds:18,title:'Cabinet, heater and stair door context'},
  {id:'v054',seconds:54,title:'Stair 2 sign and door'},
  {id:'v060',seconds:60,title:'Apartment 209 opposite side'},
  {id:'v114',seconds:114,title:'Pull station and wall heater'},
  {id:'v120',seconds:120,title:'Manual pull station close-up'},
  {id:'v144',seconds:144,title:'Heater grille and control'},
  {id:'v150',seconds:150,title:'White cabinet side'},
  {id:'v156',seconds:156,title:'Walk from Stair 2 toward T'},
  {id:'v180',seconds:180,title:'Round ceiling light and conduit'},
  {id:'v198',seconds:198,title:'Loose cable bundle and concrete brace'},
  {id:'v216',seconds:216,title:'Camera at T junction'},
  {id:'v240',seconds:240,title:'Grooved pipe junction'},
  {id:'v252',seconds:252,title:'Pipe coupling and branch connection'},
  {id:'v282',seconds:282,title:'Upright sprinkler end near east wall'},
  {id:'v294',seconds:294,title:'Exit unit and camera leads'},
  {id:'v306',seconds:306,title:'First adjoining corridor overview'},
  {id:'v324',seconds:324,title:'Opposite corridor overview'},
] as const;
export const evidenceTime=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
export const findVideoEvidence=(id:string)=>videoEvidence.find(e=>e.id===id);
export const photoEvidence = [
  {id:'stair2-paper-context',title:'Stairway 2 · paper notices and transom context, video around 00:52',file:'stair2-notices/stair2-paper-context.jpg'},
  {id:'stair2-paper-notice',title:'Stairway 2 · smoking and vaping notice, video around 00:53',file:'stair2-notices/stair2-paper-notice.jpg'},
  {id:'stair2-paper-slam',title:'Stairway 2 · please do not slam door notice, video around 00:54',file:'stair2-notices/stair2-paper-slam.jpg'},
  {id:'outlet-wall-context',title:'Hallway outlet · wall plate and baseboard context',file:'hallway-outlet/outlet-wall-context.jpg'},
  {id:'outlet-face-closeup',title:'Hallway outlet · duplex face and T slots',file:'hallway-outlet/outlet-face-closeup.jpg'},
  {id:'outlet-wall-wide',title:'Hallway outlet · wider orange-wall view',file:'hallway-outlet/outlet-wall-wide.jpg'},
  {id:'stair2-exit-front',title:'Stairway 2 · exit device front and handedness',file:'stair2-exit-device/stair2-exit-front.jpg'},
  {id:'stair2-exit-latch-side',title:'Stairway 2 · rounded latch case and strike',file:'stair2-exit-device/stair2-exit-latch-side.jpg'},
  {id:'stair2-exit-end-side',title:'Stairway 2 · hinge-side cover and end cap',file:'stair2-exit-device/stair2-exit-end-side.jpg'},
  {id:'stair2-exit-bar-profile',title:'Stairway 2 · press pad profile and projection',file:'stair2-exit-device/stair2-exit-bar-profile.jpg'},
  {id:'door210-lock-closeup',title:'Apartment 210 · keyed insert close-up',file:'door210-hardware/keyed-insert.jpg'},
  {id:'door210-lever-front',title:'Apartment 210 · lever and round rose',file:'door210-hardware/lever-front.jpg'},
  {id:'door210-lever-side',title:'Apartment 210 · lever projection and side profile',file:'door210-hardware/lever-side.jpg'},
  {id:'extinguisher-photo-1',title:'Fire extinguisher cabinet · front',file:'equipment-fire-extinguisher/photo-1.jpg'},
  {id:'extinguisher-photo-2',title:'Fire extinguisher cabinet · side and ABC marking',file:'equipment-fire-extinguisher/photo-2.jpg'},
  {id:'stair2-equipment-context',title:'Cabinet, pull station, heater and upper alarm near Stair 2',file:'equipment-fire-extinguisher/context.jpg'},
  {id:'heater-pull-photo',title:'Heater grille and Honeywell pull station close-up',file:'equipment-fire-extinguisher/heater-pull.jpg'},
  {id:'horn-strobe-photo',title:'Upper wall fire alarm and cabinet relationship',file:'equipment-fire-extinguisher/horn-strobe.jpg'},
] as const;
export const allEvidence = [...videoEvidence,...photoEvidence];
export const findEvidence=(id:string)=>allEvidence.find(e=>e.id===id);
export const evidenceCaption=(e:typeof allEvidence[number])=>'seconds' in e?`${evidenceTime(e.seconds)} · ${e.title}`:`Photo · ${e.title}`;
