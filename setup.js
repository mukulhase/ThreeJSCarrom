/**
 * Created by mukulhase on 3/27/16.
 */

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, controls;
var camera, scene, renderer;

var clock = new THREE.Clock();

var mixers = [];

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    scene = new THREE.Scene();

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 99, 0 ).normalize();
    scene.add( directionalLight );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000 );
    container.appendChild( renderer.domElement );

    // controls, camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableKeys = false;
    controls.target.set( 0, 0, 0 );
    camera.position.set( 0, 500, 700 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    if ( mixers.length > 0 ) {

        for ( var i = 0; i < mixers.length; i ++ ) {

            mixers[ i ].update( clock.getDelta() );

        }

    }


    render();

}


function render() {
    if(ready==0){
        renderer.render( scene, camera );
    }
}
