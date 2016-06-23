var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};
var sphere;
var sky, sunSphere;
var player, playerId, moveSpeed, turnSpeed;
var Cube1,Cube2,Cube3,Cube4,Cube5,Cube6;
var playerData;
var otherPlayers = [], otherPlayersId = [];




var loadWorld = function(){

    init();
    animate();

    function init(){

        //Setup------------------------------------------
        container = document.getElementById('container');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 2000000);
        // camera.position.z = 5;
        camera.position.set( 0, 100, 2000 );
        camera.lookAt( new THREE.Vector3(0,0,0));

        renderer = new THREE.WebGLRenderer( { alpha: true} );
        renderer.setSize( window.innerWidth, window.innerHeight);

        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------****************

        ///Sky**************************************
                initSky();
          
        var floor_geometry = new THREE.PlaneGeometry( 100, 100);
        var floor_material = new THREE.MeshBasicMaterial( { color: 0xA9A9A9 } );
        var floor = new THREE.Mesh( floor_geometry, floor_material );
        floor.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI); 
        scene.add(floor);
        
        Cube1=CreateCubes(10,11);
        //console.log(Cube1);
        scene.add(Cube1);
        Cube2=CreateCubes(-5,5);
        Cube3=CreateCubes(10,-10);
        Cube4=CreateCubes(2,-2);
        Cube5= CreateCubes(8,-8);
        Cube6= CreateCubes(3,-13);
        scene.add(Cube2);
        scene.add(Cube3);
        scene.add(Cube4);
        scene.add(Cube5);
        scene.add(Cube6);
        ///***********************************************************      
        //Sphere------------------
        var sphere_geometry = new THREE.SphereGeometry(1);
        var sphere_material = new THREE.MeshNormalMaterial();
        sphere = new THREE.Mesh( sphere_geometry, sphere_material );
        sphere.position.setX(1);
        sphere.position.setY(1);
        scene.add( sphere );
        objects.push( sphere ); //if you are interested in detecting an intersection with this sphere

        //Events------------------------------------------
        document.addEventListener('click', onMouseClick, false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut, false);
        document.addEventListener('keydown', onKeyDown, false );
        document.addEventListener('keyup', onKeyUp, false );
        document.addEventListener('keyj', onKeyJ, false );
        document.addEventListener('keyg', onKeyG, false );
        document.addEventListener('keyy', onKeyY, false );
        document.addEventListener('keyh', onKeyH, false );

        

        window.addEventListener( 'resize', onWindowResize, false );

        

        //Final touches-----------------------------------
        container.appendChild( renderer.domElement );
        document.body.appendChild( container );

        alert("MOVE CAMERA:\n\nZoom: Y\nZoom Out: L\nTurn Right: J\nTurn Left: G");
    }


     
            function initSky() {

                // Add Sky Mesh
                sky = new THREE.Sky();
                scene.add( sky.mesh );

                // Add Sun Helper
                sunSphere = new THREE.Mesh(
                    new THREE.SphereBufferGeometry( 20000, 16, 8 ),
                    new THREE.MeshBasicMaterial( { color: 0xffffff } )
                );
                sunSphere.position.y = - 700000;
                sunSphere.visible = false;
                scene.add( sunSphere );

                /// GUI

                var effectController  = {
                    turbidity: 10,
                    reileigh: 2,
                    mieCoefficient: 0.005,
                    mieDirectionalG: 0.8,
                    luminance: 1,
                    inclination: 0.49, // elevation / inclination
                    azimuth: 0.25, // Facing front,
                    sun: ! true
                };

                $('document').ready(function(){

                            GetTime(52.3555, -1.1743);
                        });


                        function GetTime(latitude, longitude)
                        {
                            $.ajax({
                             url: 'http://api.geonames.org/timezoneJSON',
                             data: {lat: latitude, lng: longitude, username: 'demo'},
                             success: function(Response){

                                guiChanged(Response.time);
                                console.log('success');
                             }
                            });
                        }

                var distance = 400000;

                function guiChanged(value) {
                    console.log(sky);
                    var d = new Date(value)
                    var f = new Date();
                    if(d < f)
                    {
                    var uniforms = sky.uniforms;
                    uniforms.turbidity.value = effectController.turbidity;
                    uniforms.reileigh.value = effectController.reileigh;
                    uniforms.luminance.value = effectController.luminance;
                    uniforms.mieCoefficient.value = effectController.mieCoefficient;
                    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

                    var theta = Math.PI * ( effectController.inclination - 0.5 );
                    var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

                    sunSphere.position.x = distance * Math.cos( phi );
                    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
                    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

                    sunSphere.visible = false;

                    sky.uniforms.sunPosition.value.copy( sunSphere.position );
                    }
                    else {
                        var uniforms = sky.uniforms;
                        uniforms.turbidity.value = 1;
                        uniforms.reileigh.value = 1;
                        uniforms.luminance.value = 1;
                        uniforms.mieCoefficient.value = 1;
                        uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

                        var theta = Math.PI * ( effectController.inclination - 0.5 );
                        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

                        sunSphere.position.x = distance * Math.cos( phi );
                        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
                        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

                        sunSphere.visible = false;

                        sky.uniforms.sunPosition.value.copy( sunSphere.position );
                    }
                    renderer.render( scene, camera );

                }

            }

    function CreateCubes(positionx,positionz){
            var cube_Geo = new THREE.BoxGeometry(1, 1, 1);
            var cube_Mat = new THREE.MeshBasicMaterial({color: 0x8B0000, wireframe: false});
            var cube_Mesh = new THREE.Mesh(cube_Geo, cube_Mat);
            cube_Mesh.position.setX(positionx);
            cube_Mesh.position.setY(5);
            cube_Mesh.position.setZ(positionz);
            return cube_Mesh;
            //scene.add(cube_Mesh);
            }  

    var lastRender = 0;
    function animate(timestamp){
        var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;
        Cube1.rotation.y += 0.03;
        Cube2.rotation.y += 0.03;
        Cube3.rotation.y += 0.03;
        Cube4.rotation.y += 0.03;
        Cube5.rotation.y += 0.03;
        Cube6.rotation.y += 0.03;
        requestAnimationFrame( animate );
        render();
    }
    function render(){

        if ( player ){

            updateCameraPosition();

            checkKeyStates();

            camera.lookAt(player.position);
        }

        
        //Render Scene---------------------------------------
        renderer.clear();
        renderer.render( scene , camera );
    }

    function onMouseClick(){
        intersects = calculateIntersects( event );

        if ( intersects.length > 0 ){
            //If object is intersected by mouse pointer, do something
            if (intersects[0].object == sphere){
                alert("This is a sphere!");
            }
        }
    }
    function onMouseDown(){

    }
    function onMouseUp(){

    }
    function onMouseMove(){

    }
    function onMouseOut(){

    }
    function onKeyDown( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = true;

    }

    function onKeyUp( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = false;

    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }
    
    function onKeyJ( event ){
         keyState[event.keyCode || event.which] = true;
    }

    function onKeyG ( event ){
         keyState[event.keyCode || event.which] = false;
    }

    function onKeyY ( event ){
         keyState[event.keyCode || event.which] = true;
    }

    function onKeyH ( event ){
         keyState[event.keyCode || event.which] = true;
    }

    function calculateIntersects( event ){

        //Determine objects intersected by raycaster
        event.preventDefault();

        var vector = new THREE.Vector3();
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        vector.unproject( camera );

        raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( objects );

        return intersects;
    }

    



};

var createPlayer = function(data){

    var Coolors = new THREE.Color();
    console.log(data);
    Coolors.setRGB(data.colorr,data.colorg,data.colorb);
    playerData = data;
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: Coolors.getHex(), wireframe: false});
    player = new THREE.Mesh(cube_geometry, cube_material);

    player.rotation.set(0,0,0);

    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;

    playerId = data.playerId;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;

    updateCameraPosition();
    player.position.setX(1);
    player.position.setY(1);
    objects.push( player );
    scene.add( player );

    camera.lookAt( player.position );
};

var updateCameraPosition = function(){

   
    camera.position.x = player.position.x + 6 * Math.sin( player.rotation.y );
    camera.position.y = player.position.y + 6;
    camera.position.z = player.position.z + 6 * Math.cos( player.rotation.y );
    
    
    camera.lookAt( player.position );
};

var updatePlayerPosition = function(data){

    var somePlayer = playerForId(data.playerId);

    somePlayer.position.x = data.x;
    somePlayer.position.y = data.y;
    somePlayer.position.z = data.z;

    somePlayer.rotation.x = data.r_x;
    somePlayer.rotation.y = data.r_y;
    somePlayer.rotation.z = data.r_z;

};

var updatePlayerData = function(){
    playerData.x = player.position.x;
    playerData.y = player.position.y;
    playerData.z = player.position.z;

    playerData.r_x = player.rotation.x;
    playerData.r_y = player.rotation.y;
    playerData.r_z = player.rotation.z;

};
var checkKeyStates = function(){

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;


    if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        player.position.x -= moveSpeed * Math.sin(player.rotation.y);
        player.position.z -= moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        player.position.x += moveSpeed * Math.sin(player.rotation.y);
        player.position.z += moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        player.rotation.y += turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        player.rotation.y -= turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[81]) {
        // 'q' - strafe left
        player.position.x -= moveSpeed * Math.cos(player.rotation.y);
        player.position.z += moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[69]) {
        // 'e' - strage right
        player.position.x += moveSpeed * Math.cos(player.rotation.y);
        player.position.z -= moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }



    if(keyState[74]){
        
        camera.position.x = x * 5;  
    }

    if(keyState[71]){
       
        camera.position.x = x * -5;
       
    }

     if(keyState[89]){

        camera.position.y = y * 5;
    }

     if(keyState[72]){

        camera.position.y = y * -5;
    }

    

};

var addOtherPlayer = function(data){
    var Coolors = new THREE.Color();
    console.log(data);
    Coolors.setRGB(data.colorr,data.colorg,data.colorb);
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: Coolors.getHex(), wireframe: false});
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;

    otherPlayersId.push( data.playerId );
    otherPlayers.push( otherPlayer );
    objects.push( otherPlayer );
    scene.add( otherPlayer );

};

var removeOtherPlayer = function(data){

    scene.remove( playerForId(data.playerId) );

};

var playerForId = function(id){
    var index;
    for (var i = 0; i < otherPlayersId.length; i++){
        if (otherPlayersId[i] == id){
            index = i;
            break;
        }
    }
    return otherPlayers[index];
};
