import*as THREE from"three";import{OrbitControls}from"https://unpkg.com/three@0.145.0/examples/jsm/controls/OrbitControls.js";import{GLTFLoader}from"https://unpkg.com/three@0.145.0/examples/jsm/loaders/GLTFLoader.js";import{TWEEN}from"https://unpkg.com/three@0.145.0/examples/jsm/libs/tween.module.min.js";import{DRACOLoader}from"https://unpkg.com/three@0.145.0/examples/jsm/loaders/DRACOLoader.js";import{EffectComposer}from"https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/EffectComposer.js";import{RenderPass}from"https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/RenderPass.js";import{UnrealBloomPass}from"https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/UnrealBloomPass.js";import{BokehPass}from"https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/BokehPass.js";import{MeshSurfaceSampler}from"https://unpkg.com/three@0.145.0/examples/jsm/math/MeshSurfaceSampler.js";import{VignetteShader}from"https://unpkg.com/three@0.145.0/examples/jsm/shaders/VignetteShader.js";import{ShaderPass}from"https://unpkg.com/three@0.145.0/examples/jsm/postprocessing/ShaderPass.js";import{GUI}from"https://unpkg.com/three@0.145.0/examples/jsm/libs/lil-gui.module.min.js";const dracoLoader=new DRACOLoader,loader=new GLTFLoader;dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"),dracoLoader.setDecoderConfig({type:"js"}),loader.setDRACOLoader(dracoLoader);const container=document.getElementById("threejs-container"),scene=new THREE.Scene;scene.background=new THREE.Color(789516);const renderer=new THREE.WebGLRenderer({antialias:!1,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1)),renderer.setSize(window.innerWidth,window.innerHeight),renderer.outputEncoding=THREE.sRGBEncoding,container.appendChild(renderer.domElement);const camera=new THREE.PerspectiveCamera(35,window.innerWidth/window.innerHeight,1e-4,3e3);camera.position.set(34,16,-20),scene.add(camera),window.addEventListener("resize",(()=>{const e=window.innerWidth,t=window.innerHeight;camera.aspect=e/t,camera.updateProjectionMatrix(),renderer.setSize(e,t),composer.setSize(e,t),composer.setPixelRatio(Math.min(window.devicePixelRatio,1)),renderer.setPixelRatio(Math.min(window.devicePixelRatio,1)),m.uniforms.iResolution.value.set(e,t),chromaticAberration.uniforms.resolution.value=new THREE.Vector2(window.innerWidth*Math.min(window.devicePixelRatio,1),window.innerHeight*Math.min(window.devicePixelRatio,1))}));const controls=new OrbitControls(camera,renderer.domElement);let sampler;loader.load("https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/brain.glb?v=1674943853430",(function(e){e.scene.traverse((e=>{e.isMesh&&(sampler=new MeshSurfaceSampler(e).build())})),transformMesh()}));const textureLoader=new THREE.TextureLoader,sprite1=textureLoader.load("https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle1.jpg?v=1674991096849"),sprite2=textureLoader.load("https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle2.jpg?v=1674991097300");let uniforms={mousePos:{value:new THREE.Vector3}},pointsGeometry=new THREE.BufferGeometry,points;const cursor=new THREE.Vector3(0,0,0),vertices=[],tempPosition=new THREE.Vector3,materials=[];let parameters=[[[.04,.36,.6],sprite2,.42,.15],[[1,.02,.53],sprite1,.58,.2]];function transformMesh(){for(let e=0;e<1200;e++)sampler.sample(tempPosition),vertices.push(tempPosition.x,tempPosition.y,tempPosition.z);pointsGeometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));for(let e=0;e<parameters.length;e++){const t=parameters[e][0],n=parameters[e][1];parameters[e][2],parameters[e][3];materials[e]=new THREE.PointsMaterial({size:1.5,map:n,blending:THREE.AdditiveBlending,depthWrite:!1,transparent:!0,sizeAttenuation:!0,opacity:1}),materials[e].color.setHSL(t[0],t[1],t[2]),materials[e].onBeforeCompile=function(e){e.uniforms.mousePos=uniforms.mousePos,e.vertexShader=`\n              uniform vec3 mousePos;\n              varying float vNormal;\n\n              ${e.vertexShader}`.replace("#include <begin_vertex>","#include <begin_vertex>   \n                vec3 seg = position - mousePos;\n                vec3 dir = normalize(seg);\n                float dist = length(seg);\n\n             if (dist < 3.5){\n              float force = clamp(1.9, 0.7, 3.2);\n              transformed -= -dir * force;\n              vNormal = force;\n                }\n              ")};const o=new THREE.Points(pointsGeometry,materials[e]);o.position.x=-.6*Math.random()*.6,o.position.z=-2.9- -2.5*Math.random(),scene.add(o)}introAnimation()}function generateTexture(){const random=Math.round(Math.random()),texturePath0="https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle1.jpg?v=1674991096849",texturePath1="https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/particle2.jpg?v=1674991097300",texture=(new THREE.TextureLoader).load(eval(`texturePath${random}`));return texture}function introAnimation(){controls.enabled=!1,new TWEEN.Tween(camera.position.set(0,-1,25)).to({x:2,y:-.4,z:2.5},1800).delay(2e3).easing(TWEEN.Easing.Cubic.InOut).start().onComplete((function(){setOrbitControlsLimits(),TWEEN.remove(this)})),new TWEEN.Tween(materials[0]).to({opacity:parameters[0][3],size:parameters[0][2]},3500).delay(2e3).easing(TWEEN.Easing.Cubic.InOut).start().onComplete((function(){TWEEN.remove(this)})),new TWEEN.Tween(materials[1]).to({opacity:parameters[1][3],size:parameters[1][2]},1500).delay(2e3).easing(TWEEN.Easing.Cubic.InOut).start().onComplete((function(){TWEEN.remove(this)})),console.log(parameters[1][3])}function setOrbitControlsLimits(){controls.enableDamping=!0,controls.dampingFactor=.04,controls.minDistance=.5,controls.maxDistance=30,controls.enableRotate=!0,controls.enableZoom=!0,controls.zoomSpeed=.5}let width=window.innerWidth,height=window.innerHeight;const renderPass=new RenderPass(scene,camera),renderTarget=new THREE.WebGLRenderTarget(width,height,{samples:2}),bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),.79,.4,.09),composer=new EffectComposer(renderer,renderTarget);composer.setPixelRatio(Math.min(window.devicePixelRatio,1));const bokehPass=new BokehPass(scene,camera,{focus:3.8269,aperture:.039,maxblur:.03}),effectVignette=new ShaderPass(VignetteShader);effectVignette.uniforms.offset.value=.95,effectVignette.uniforms.darkness.value=1.1;const chromaticAberration={uniforms:{tDiffuse:{type:"t",value:null},resolution:{value:new THREE.Vector2(window.innerWidth*Math.min(window.devicePixelRatio,1),window.innerHeight*Math.min(window.devicePixelRatio,1))},power:{value:.5}},vertexShader:"\n    \n        varying vec2 vUv;\n    \n        void main() {\n    \n          vUv = uv;\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n    \n        }\n        ",fragmentShader:"\n\t\t\tuniform sampler2D tDiffuse;\n\t\t\tuniform vec2 resolution;\n      varying vec2 vUv;\n      \n\n\t\t\tvec2 barrelDistortion(vec2 coord, float amt) {\n\t\t\t\tvec2 cc = coord - 0.5;\n\t\t\t\tfloat dist = dot(cc, cc);\n\t\t\t\treturn coord + cc * dist * amt;\n\t\t\t}\n\n\t\t\tfloat sat( float t )\n\t\t\t{\n\t\t\t\treturn clamp( t, 0.0, 1.0 );\n\t\t\t}\n\n\t\t\tfloat linterp( float t ) {\n\t\t\t\treturn sat( 1.0 - abs( 2.0*t - 1.0 ) );\n\t\t\t}\n\n\t\t\tfloat remap( float t, float a, float b ) {\n\t\t\t\treturn sat( (t - a) / (b - a) );\n\t\t\t}\n\n\t\t\tvec4 spectrum_offset( float t ) {\n\t\t\t\tvec4 ret;\n\t\t\t\tfloat lo = step(t,0.5);\n\t\t\t\tfloat hi = 1.0-lo;\n\t\t\t\tfloat w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );\n\t\t\t\tret = vec4(lo,1.0,hi, 1.) * vec4(1.0-w, w, 1.0-w, 1.);\n\n\t\t\t\treturn pow( ret, vec4(1.0/2.2) );\n\t\t\t}\n\n\t\t\tconst float max_distort = 2.2;\n\t\t\tconst int num_iter = 12;\n\t\t\tconst float reci_num_iter_f = 1.0 / float(num_iter);\n\n\t\t\tvoid main()\n\t\t\t{\t\n\t\t\t\tvec2 uv= vUv;\n\t\t\t\tvec4 sumcol = vec4(0.0);\n\t\t\t\tvec4 sumw = vec4(0.0);\t\n\t\t\t\tfor ( int i=0; i<num_iter;++i )\n\t\t\t\t{\n\t\t\t\t\tfloat t = float(i) * reci_num_iter_f;\n\t\t\t\t\tvec4 w = spectrum_offset( t );\n\t\t\t\t\tsumw += w;\n\t\t\t\t\tsumcol += w * texture2D( tDiffuse, barrelDistortion(uv, .1 * max_distort*t ) );\n\t\t\t\t}\n\n\t\t\t\tgl_FragColor = sumcol / sumw;\n\t\t\t}\n      "};let chromaticAberrationPass=new ShaderPass(chromaticAberration);composer.addPass(renderPass),composer.addPass(effectVignette),composer.addPass(chromaticAberrationPass),composer.addPass(bloom),composer.addPass(bokehPass);const postprocessing={};postprocessing.composer=composer,postprocessing.bokeh=bokehPass;const effectController={focus:89.72,aperture:7.3,maxblur:.05},matChanger=function(){postprocessing.bokeh.uniforms.focus.value=effectController.focus,postprocessing.bokeh.uniforms.aperture.value=1e-5*effectController.aperture,postprocessing.bokeh.uniforms.maxblur.value=effectController.maxblur};matChanger();let g=new THREE.PlaneBufferGeometry(2,2),m=new THREE.ShaderMaterial({side:THREE.DoubleSide,depthTest:!1,uniforms:{iTime:{value:0},iResolution:{value:new THREE.Vector2},mousePos:{value:new THREE.Vector2}},vertexShader:"\n        varying vec2 vUv;\n        void main(){\n            vUv = uv;\n            gl_Position = vec4( position, 1.0 );\n        }",fragmentShader:"\n        varying vec2 vUv;\n        uniform float iTime;\n        uniform vec2 iResolution;\n        uniform vec2 mousePos;\n\n        #define N 16\n        #define PI 3.14159265\n        #define depth 1.0\n        #define rate 0.3\n        #define huecenter 0.5\n\n        vec3 hsv2rgb( in vec3 c )\n        {\n            vec3 rgb = clamp( abs(mod(c.y*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, .3 );\n            return c.x * mix( vec3(.1), rgb, 1.0);\n        }\n\n        void main(){\n            vec2 v = gl_FragCoord.xy/iResolution.xy;\n            float t = iTime * 0.1;\n            float r = 1.8;\n            float d = 0.0;\n            for (int i = 1; i < N; i++) {\n                d = (PI / float(N)) * (float(i) * 14.0);\n                r += length(vec2(rate*v.y, rate*v.x)) + 1.21;\n                v = vec2(v.x+cos(v.y+cos(r)+d)+cos(t),v.y-sin(v.x+cos(r)+d)+sin(t));\n            }\n            r = (sin(r*0.2)* 0.9)+0.4;            \n            vec3 hsv = vec3(\n                mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2,0.5), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)\n                // mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2,vUv.y -0.1), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)\n                \n                // mod(vUv.x, 1.0), 1.0-0.5*pow(max(r,0.4)*1.2, vUv.y), 1.0-0.2*pow(max(r,0.4)*2.2,6.0)\n                \n            );\n            gl_FragColor = vec4(hsv2rgb(hsv), 1.0);\n        }"});const p=new THREE.Mesh(g,m);scene.add(p),m.uniforms.iResolution.value.set(width,height);let cursorNew=new THREE.Vector3;const clock=new THREE.Clock;function rendeLoop(){const e=clock.getElapsedTime();TWEEN.update(),controls.update(),composer.render(),cursorNew.lerp(cursor,.01),uniforms.mousePos.value.set(cursorNew.x,-cursorNew.y,cursorNew.x/.4),m.uniforms.iTime.value=e;for(let t=0;t<scene.children.length;t++){const n=scene.children[t];n instanceof THREE.Points&&(n.rotation.y=e*(t<.5?t+.02:-(t+.02))*.02,n.rotation.x=e*(t<.5?t+.02:-(t+.02))*.02)}requestAnimationFrame(rendeLoop)}rendeLoop(),document.addEventListener("mousemove",(e=>{e.preventDefault(),cursor.x=e.clientX/window.innerWidth-.5,cursor.y=e.clientY/window.innerHeight-.5}),!1);
