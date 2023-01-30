import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.145.0/examples/jsm/loaders/GLTFLoader.js";
import { TWEEN } from "https://unpkg.com/three@0.145.0/examples/jsm/libs/tween.module.min.js";
import { DRACOLoader } from 'https://unpkg.com/three@0.145.0/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/BokehPass.js';
import { MeshSurfaceSampler } from 'https://unpkg.com/three@0.145.0/examples/jsm/math/MeshSurfaceSampler.js'
import { VignetteShader } from 'https://unpkg.com/three@0.145.0/examples/jsm/shaders/VignetteShader.js';
import { ShaderPass } from 'https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/ShaderPass.js';
import { GUI } from 'https://unpkg.com/three@0.145.0/examples/jsm/libs/lil-gui.module.min.js';


/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.getElementById('threejs-container')

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xc0c0c)

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.0001, 3000)
camera.position.set(34,16,-20)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    composer.setSize(width, height)
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    m.uniforms.iResolution.value.set(width, height)
  
  chromaticAberration.uniforms["resolution"].value = new THREE.Vector2(
		window.innerWidth *Math.min(window.devicePixelRatio, 1),
		window.innerHeight *Math.min(window.devicePixelRatio, 1))

})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/brain.glb?v=1674943853430', function (gltf) {
    
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            sampler = new MeshSurfaceSampler(obj).build()
        }
    })

    transformMesh()
})

/////////////////////////////////////////////////////////////////////////
///// TRANSFORM MESH INTO POINTS
let sampler

const textureLoader = new THREE.TextureLoader();

const sprite1 = textureLoader.load( 'https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle1.jpg?v=1674991096849' );
const sprite2 = textureLoader.load( 'https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle2.jpg?v=1674991097300' );

let uniforms = { mousePos: {value: new THREE.Vector3()} }
let pointsGeometry = new THREE.BufferGeometry()
let points
const cursor = new THREE.Vector3(0, 0, 0)
const vertices = []
const tempPosition = new THREE.Vector3()
const materials = [];
let parameters = [
  [[ 0.04, 0.36, 0.60 ], sprite2, 0.42, 0.5 ],
  [[ 1.00, 0.02, 0.53 ], sprite1, 0.58, 0.4 ],
];

function transformMesh(){
    // Loop to sample a coordinate for each points
    for (let i = 0; i < 1200; i ++) {
        // Sample a random position in the model
        sampler.sample(tempPosition)
        // Push the coordinates of the sampled coordinates into the array
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z)
    }
    
    // Define all points positions from the previously created array
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  
  
  
      for ( let i = 0; i < parameters.length; i ++ ) {

					const color = parameters[ i ][ 0 ];
					const sprite = parameters[ i ][ 1 ];
					const size = parameters[ i ][ 2 ];
					const opacity = parameters[ i ][ 3 ];
        

					materials[ i ] = new THREE.PointsMaterial( { 
            size: 1.5, 
            map: sprite, 
            blending: THREE.AdditiveBlending, 
            depthWrite: false,
            transparent: true,
            sizeAttenuation: true,
            opacity: 1
            
          } );
					materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );
        
          materials[i].onBeforeCompile = function(shader) {
            shader.uniforms.mousePos = uniforms.mousePos

            shader.vertexShader = `
              uniform vec3 mousePos;
              varying float vNormal;

              ${shader.vertexShader}`.replace(
              `#include <begin_vertex>`,
              `#include <begin_vertex>   
                vec3 seg = position - mousePos;
                vec3 dir = normalize(seg);
                float dist = length(seg);

             if (dist < 3.5){
              float force = clamp(1.9, 0.7, 3.2);
              transformed -= -dir * force;
              vNormal = force;
                }
              `
            )
          }

					const points = new THREE.Points( pointsGeometry, materials[ i ] );

					points.position.x = -0.6 * Math.random() * 0.6;
					points.position.z = -2.9 - Math.random() * -2.5;

					scene.add( points );

    }
  
introAnimation() // call intro animation on start
  

}

function generateTexture(){
  const random = Math.round(Math.random())
  const texturePath0 = 'https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle1.jpg?v=1674991096849'
  const texturePath1 = 'https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle2.jpg?v=1674991097300'

  const texture = new THREE.TextureLoader().load(eval(`texturePath${random}`))
  return texture
}

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false //disable orbit controls to animate the camera
    
    new TWEEN.Tween(camera.position.set(0,-1,25)).to({ // from camera position
        x: 2,
        y: -0.4,
        z: 2.5
    }, 1800) 
  .delay(2000)
    .easing(TWEEN.Easing.Cubic.InOut).start() 
    .onComplete(function () { 
        setOrbitControlsLimits()
        TWEEN.remove(this)
    })
  
  new TWEEN.Tween(materials[0]).to({ // from camera position
        opacity: parameters[0][3],
        size: parameters[0][2]
    }, 3500) 
  .delay(2000)
    .easing(TWEEN.Easing.Cubic.InOut).start() 
    .onComplete(function () { 
        TWEEN.remove(this)
    })
  
  new TWEEN.Tween(materials[1]).to({ // from camera position
        opacity: parameters[1][3],
        size: parameters[1][2]
    }, 1500) 
  .delay(2000)
    .easing(TWEEN.Easing.Cubic.InOut).start() 
    .onComplete(function () { 
        TWEEN.remove(this)
    })
  
  console.log(parameters[1][3])
  
}


/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 0.5
    controls.maxDistance = 30
    controls.enableRotate = true
    controls.enableZoom = true
    controls.zoomSpeed = 0.5
    
}

// controls.autoRotate = true
/////////////////////////////////////////////////////////////////////////
///// POST PROCESSING EFFECTS
let width = window.innerWidth
let height = window.innerHeight
const renderPass = new RenderPass( scene, camera )
const renderTarget = new THREE.WebGLRenderTarget( width, height,
    {
        samples: 2,
    }
)

const bloom = new UnrealBloomPass(new THREE.Vector2( window.innerWidth , window.innerHeight ), 0.79, 0.4, 0.09)

const composer = new EffectComposer(renderer, renderTarget)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1))

const bokehPass = new BokehPass( scene, camera, {
					focus: 3.8269,
					aperture: 0.039,
					maxblur: 0.03
} );

const effectVignette = new ShaderPass( VignetteShader );
effectVignette.uniforms[ 'offset' ].value = 0.95;
effectVignette.uniforms[ 'darkness' ].value = 1.1;


const chromaticAberration = {
		uniforms: {
			tDiffuse: { type: "t", value: null },
			resolution: {
				value: new THREE.Vector2(
					window.innerWidth * Math.min(window.devicePixelRatio, 1),
					window.innerHeight * Math.min(window.devicePixelRatio, 1)
				)
			},
			power: { value: 0.5 }
		},

		vertexShader: `
    
        varying vec2 vUv;
    
        void main() {
    
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
        }
        `,

		fragmentShader: `
			uniform sampler2D tDiffuse;
			uniform vec2 resolution;
      varying vec2 vUv;
      

			vec2 barrelDistortion(vec2 coord, float amt) {
				vec2 cc = coord - 0.5;
				float dist = dot(cc, cc);
				return coord + cc * dist * amt;
			}

			float sat( float t )
			{
				return clamp( t, 0.0, 1.0 );
			}

			float linterp( float t ) {
				return sat( 1.0 - abs( 2.0*t - 1.0 ) );
			}

			float remap( float t, float a, float b ) {
				return sat( (t - a) / (b - a) );
			}

			vec4 spectrum_offset( float t ) {
				vec4 ret;
				float lo = step(t,0.5);
				float hi = 1.0-lo;
				float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
				ret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);

				return pow( ret, vec4(1.0/2.2) );
			}

			const float max_distort = 2.2;
			const int num_iter = 12;
			const float reci_num_iter_f = 1.0 / float(num_iter);

			void main()
			{	
				vec2 uv= vUv;
				vec4 sumcol = vec4(0.0);
				vec4 sumw = vec4(0.0);	
				for ( int i=0; i<num_iter;++i )
				{
					float t = float(i) * reci_num_iter_f;
					vec4 w = spectrum_offset( t );
					sumw += w;
					sumcol += w * texture2D( tDiffuse, barrelDistortion(uv, .1 * max_distort*t ) );
				}

				gl_FragColor = sumcol / sumw;
			}
      `
	};
	let chromaticAberrationPass = new ShaderPass(chromaticAberration);


/////DISTORT PASS //////////////////////////////////////////////////////////////

composer.addPass( renderPass )
composer.addPass( effectVignette )
composer.addPass( chromaticAberrationPass )

composer.addPass( bloom )

composer.addPass( bokehPass )

const postprocessing = {};

postprocessing.composer = composer;
postprocessing.bokeh = bokehPass;

const effectController = {

  focus: 89.72,
  aperture: 7.3,
  maxblur: 0.05

};

const matChanger = function ( ) {

  postprocessing.bokeh.uniforms[ 'focus' ].value = effectController.focus;
  postprocessing.bokeh.uniforms[ 'aperture' ].value = effectController.aperture * 0.00001;
  postprocessing.bokeh.uniforms[ 'maxblur' ].value = effectController.maxblur;

};

const gui = new GUI();
gui.add( effectController, 'focus', 0, 3000.0, 0.01 ).onChange( matChanger );
gui.add( effectController, 'aperture', 0, 10, 0.01 ).onChange( matChanger );
gui.add( effectController, 'maxblur', 0.0, 0.05, 0.01 ).onChange( matChanger );
gui.close();

				matChanger();

/////////////////////////////////////////////////////////////////////////
//// CUSTOM SHADER ANIMATED BACKGROUND
let g = new THREE.PlaneBufferGeometry(2, 2)
let m = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    depthTest: false,
    uniforms: {
      iTime: { value: 0 },
      iResolution:  { value: new THREE.Vector2() },
      mousePos: {value: new THREE.Vector2()}
    },
    vertexShader: `
        varying vec2 vUv;
        void main(){
            vUv = uv;
            gl_Position = vec4( position, 1.0 );
        }`,
    fragmentShader: `
        varying vec2 vUv;
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 mousePos;

        #define N 16
        #define PI 3.14159265
        #define depth 1.0
        #define rate 0.3
        #define huecenter 0.5

        vec3 hsv2rgb( in vec3 c )
        {
            vec3 rgb = clamp( abs(mod(c.y*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, .3 );
            return c.x * mix( vec3(.1), rgb, 1.0);
        }

        void main(){
            vec2 v = gl_FragCoord.xy/iResolution.xy;
            float t = iTime * 0.1;
            float r = 1.8;
            float d = 0.0;
            for (int i = 1; i < N; i++) {
                d = (PI / float(N)) * (float(i) * 14.0);
                r += length(vec2(rate*v.y, rate*v.x)) + 1.21;
                v = vec2(v.x+cos(v.y+cos(r)+d)+cos(t),v.y-sin(v.x+cos(r)+d)+sin(t));
            }
            r = (sin(r*0.2)* 0.9)+0.4;            
            vec3 hsv = vec3(
                mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2,0.5), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)
                // mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2,vUv.y -0.1), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)
                
                // mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2, vUv.y), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)
                
            );
            gl_FragColor = vec4(hsv2rgb(hsv), 1.0);
        }`
    })

const p = new THREE.Mesh(g, m)
scene.add(p)

m.uniforms.iResolution.value.set(width, height)

let cursorNew = new THREE.Vector3()
/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
const clock = new THREE.Clock()
function rendeLoop() {
    const time = clock.getElapsedTime() 

    TWEEN.update() // update animations

    controls.update() // update orbit controls

    composer.render() //render the scene with the composer
  
    cursorNew.lerp(cursor, 0.01)
  
    uniforms.mousePos.value.set(cursorNew.x, -cursorNew.y, cursorNew.x / 0.4)
    m.uniforms.iTime.value = time
  
    for ( let i = 0; i < scene.children.length; i ++ ) {

      const object = scene.children[ i ];

      if ( object instanceof THREE.Points ) {

        object.rotation.y = time * ( i < 0.5 ? i + 0.02 : - ( i + 0.02 ) ) * 0.02;
        object.rotation.x = time * ( i < 0.5 ? i + 0.02 : - ( i + 0.02 ) ) * 0.02;

      }

    }


    requestAnimationFrame(rendeLoop) //loop the render function    
}

rendeLoop() //start rendering

//////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET CAMERA POSITION
document.addEventListener('mousemove', (event) => {
    event.preventDefault()
    cursor.x = event.clientX / window.innerWidth -0.5
    cursor.y = event.clientY / window.innerHeight -0.5

}, false)
