let DEBUG = false;

let SCENE_MANAGER = {};

let PLAYER = {};

var DMGPOP = {};

let HPBAR = {};

let VFX = {};

let SHADERS = {};


let GRID = {};


let MESH_LIBRARY = {};
// Contains:
//   'Plants'
//     'Grass'
//     'Tree'
//   'BuildingType'
//     'Wall'
//     'Roof'

let targetBaseOnCameraView = true; // if false target based on character rotation
// use touch joystick for mobile options

let DYNAMIC_CAMERA = false;
// Used for game controller on pc and shows joystick on mobile.
// Emulates KOA smooth camera follow effect  
let ON_MOBILE = true
let CANVASES = []; //One canvas For Game, one for Mobile Input Detection

// todo move this from global. used for mobile input
let inputMap = {};




// Graphics Settings
let WEBGPU = false; //otherwise use WebGL