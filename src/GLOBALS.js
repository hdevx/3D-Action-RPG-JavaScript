let DEBUG = false;

let SCENE_MANAGER = {};

let PLAYER = {};

var DMGPOP = {};

let HPBAR = {};

let VFX = {};

let SHADERS = {};



let targetBaseOnCameraView = true; // if false target based on character rotation
// use touch joystick for mobile options

let DYNAMIC_CAMERA = false;
// Used for game controller on pc and shows joystick on mobile.
// Emulates KOA smooth camera follow effect  


// Graphics Settings
let WEBGPU = false; //otherwise use WebGL