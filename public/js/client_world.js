var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};
var sphere;
var distance = 400000;
var sky, sunSphere;
var player, playerId, moveSpeed, turnSpeed;
var textofinal,fonttime;
var Cube1,Cube2,Cube3,Cube4,Cube5,Cube6;
var textureLoader;
var materials = [];
var Texto;
var FontLoaders;
var fontmesh,fonttimemesh;
var playerData;
var otherPlayers = [], otherPlayersId = [];
var controls,effect;
var reticle;
var uniforms;
var Wea,p;
var clock;
var floor;
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
var particles;
var totalParticles;
var maxParticleSize ;
var particleRotationSpeed = 0.1;
var particleRotationDeg = 0;
var lastColorRange = [0, 0.3];
var currentColorRange = [0, 0.3];
var lastCubeToSee;


var listener; 
var audioLoader;
var sound;

var particleTexture;
var spriteMaterial;
var WeatherDic = [{name:"Clouds",color:0x92AcA6},{name:"ThunderStorm",color:003333},{name:"Rain",color:0x336699},{name:"Snow",color:0xFFFFFF},{name:"Haze",color:0x99FFFF}]

var loadWorld = function(){

    init();
    animate();

    function init(){
        clock = new THREE.Clock();
        //Setup------------------------------------------
        container = document.getElementById('container');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 2000000);
        // camera.position.z = 5;
        camera.position.set( 0, 4, 0);
        camera.lookAt( new THREE.Vector3(0,4,0));

        renderer = new THREE.WebGLRenderer( { alpha: true} );
        renderer.setSize( window.innerWidth, window.innerHeight);

        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------****************

        ///Sky**************************************
        
        initSky();

        var floortextureLoader = new THREE.TextureLoader();
        var floortexture = floortextureLoader.load( '../img/Floor.png' );  
        var floor_geometry = new THREE.PlaneGeometry( 30, 30);
        var floor_material = new THREE.MeshBasicMaterial( {map:floortexture} );
        floor = new THREE.Mesh( floor_geometry, floor_material );
        floor.rotation.set(-Math.PI/2, Math.PI/2000, Math.PI); 
        scene.add(floor);
        
        
        Cube3=CreateCubes(-5,4,-1,"Tokyo");
        Cube2=CreateCubes(-3,4,-3,"Paris");
        Cube1=CreateCubes(0,4,-5,"Londres");            
        Cube4=CreateCubes(3,4,-5,"Turquia");
        Cube5=CreateCubes(5,4,-3,"NYC");
        Cube6=CreateCubes(7,4,-1,"SantoDomingo");
        
        scene.add(Cube1);
        scene.add(Cube2);
        scene.add(Cube3);
        scene.add(Cube4);
        scene.add(Cube5);
        scene.add(Cube6);

        lastCubeToSee='test';
        ///***********************************************************      
        //Sphere------------------
        var sphere_geometry = new THREE.SphereGeometry(1);
        var sphere_material = new THREE.MeshNormalMaterial();
        sphere = new THREE.Mesh( sphere_geometry, sphere_material );
        sphere.position.setX(1);
        sphere.position.setY(1);
        //scene.add( sphere );
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
        // Apply VR headset positional data to camera.
        controls = new THREE.VRControls(camera);
        //controls.target.set(camera.position.x,camera.position.y+10,camera.position.z);
        // Apply VR stereo rendering to renderer.
        //console.log(controls);
        reticle = new vreticle.Reticle(camera);
        reticle.add_collider(Cube1);
        reticle.add_collider(Cube2);
        reticle.add_collider(Cube3);
        reticle.add_collider(Cube4);
        reticle.add_collider(Cube5);
        reticle.add_collider(Cube6);
        effect = new THREE.VREffect(renderer);
        effect.setSize(window.innerWidth, window.innerHeight);
        scene.add(camera);


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
                $('document').ready(function(){

                            //GetTime(52.3555, -0.1);
                            Wea = SunCalc.getTimes(new Date(), 51.5, -0.1);
                            p = SunCalc.getPosition(Wea.sunrise, 51.5, -0.1);
                           // console.log(Wea);
                          //  console.log(new Date());
                            //console.log(p);
                            guiChanged(p.azimuth);
                        });
            }

            RecticleEvento(Cube1);
            RecticleEvento(Cube2);
            RecticleEvento(Cube3);
            RecticleEvento(Cube4);
            RecticleEvento(Cube5);
            RecticleEvento(Cube6);

            function Particulas(name){
                    scene.remove(particles);
                    particles = new THREE.Object3D();
                    var valorColor;
                    //console.log(colores);
                    for(var i=0; i< WeatherDic.length ; i++){
                        if(WeatherDic[i].name == name)
                        {
                            valorColor = WeatherDic[i].color;
                            //console.log(valorColor);
                        }
                    }

                    particleTexture = new THREE.ImageUtils.loadTexture('../img/'+name+'.png'),
                    spriteMaterial = new THREE.SpriteMaterial({
                    map: particleTexture,
                    color: valorColor
                });


                switch(name){
                case 'Clouds':
                    maxParticleSize=500;
                    totalParticles=150;
                    break;
                case 'Rain':
                    maxParticleSize=50;
                    totalParticles=20;
                    break;
                case 'Snow':
                    maxParticleSize=50;
                    totalParticles=15;
                    break;

                case 'Mist':
                    maxParticleSize=60;
                    totalParticles=10;
                    break;

                case 'ThunderStorm':
                    maxParticleSize=60;
                    totalParticles=20;
                    break;

                case 'Haze':
                    maxParticleSize=50;
                    totalParticles=15;
                    break;

                }

                for (var i = 0; i < totalParticles; i++) {
                    var sprite = new THREE.Sprite(spriteMaterial);
                    sprite.scale.set(64, 64, 1.0);
                    sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
                    sprite.position.setLength(maxParticleSize * Math.random());
                    sprite.material.blending = THREE.AdditiveBlending;
                    particles.add(sprite);
                }
                particles.position.y = 70;
                scene.add(particles);
            }
            
            function RequestOpenWeather(lati,longit){
                $.ajax({
                             url: 'http://api.openweathermap.org/data/2.5/weather?',
                             data: {lat:lati,lon:longit,appid:'93ef2429222f3be36dd7cdac53cd524d'},
                             success: function(Response){

                                //guiChanged(Response.time);
                               // console.log(Response.weather[0].main);

                               if(Response.weather[0].main!='Clear')
                                Particulas(Response.weather[0].main);


                                console.log("Particulas: "+Response.weather[0].main);
                             }
                            });
            }


               function RequestTimeZone(font,lat,longi){
                scene.remove(fonttimemesh);
                $.ajax({
                             url: 'http://api.timezonedb.com/v2/get-time-zone',
                             data: {key:'EZSH2MHY2OAN',format:'json',by:'position',lat:lat,lng:longi},
                             success: function(Response){

                                //guiChanged(Response.time);
                               // console.log(Response.timestamp);
                                var te = new Date(Response.timestamp*1000);
                                var pru = te.getHours()+4;
                                var minn = "0"+te.getMinutes();
                                var see = "0"+te.getSeconds();

                                if(pru>=24)
                                    pru-=24;

                                textofinal = pru + ':' + minn.substr(-2) + ':'+ see.substr(-2);
                                fonttime = new THREE.TextGeometry(textofinal,{
                                    font: font,
                                    size: 0.5,
                                    height: 0.05,
                                });
                                fonttimemesh = new THREE.Mesh(fonttime,new THREE.MeshBasicMaterial({color: 'blue', opacity: 0}));
                                fonttimemesh.position.y = 5;
                                fonttimemesh.position.z = -5;
                                fonttimemesh.position.x = 0;
                                fonttimemesh.rotation.y = 0;
                                scene.add(fonttimemesh);
                                GetTime(pru);
                                guiChanged();
                                
                             }
                            });

            }

            function InitFont(font,name)
            {
                scene.remove(fontmesh);
                Texto = new THREE.TextGeometry( name, {

                    font: font,
                    size: 1,
                    height: 0.05,

                });
                
                fontmesh = new THREE.Mesh(Texto,new THREE.MeshBasicMaterial({color: 'blue', opacity: 0}));
                
                fontmesh.position.y = 6;
                fontmesh.position.z = -5;
                fontmesh.position.x = 0;
                fontmesh.rotation.y = 0;

                scene.add(fontmesh);

            }


            function InitAudio(name){


                if(sound!=undefined){
                  sound.stop();  
                }

                listener = new THREE.AudioListener();
                audioLoader = new THREE.AudioLoader();
                sound = new THREE.PositionalAudio( listener );

                scene.add(sound);

                audioLoader.load( 'audio/'+ name +'.mp3', function( buffer ) {
                    sound.setBuffer( buffer );
                    sound.setRefDistance( 20 );
                    sound.play();
                });    

            }

            function RecticleEvento(Cubo)
            {
                Cubo.ongazelong = function(){
                //console.log('entre');
                  
                  if (lastCubeToSee!=Cubo.name){
                    socket.emit('LookingCube', Cubo.name);
                    lastCubeToSee=Cubo.name;
                  }
                       

                }
                Cubo.ongazeover = function(){
                //    this.material = reticle.get_random_hex_material();
                
                }
                Cubo.ongazeout = function(){
                //    this.material = reticle.default_material();
                }
            }

    function CreateCubes(positionx,positiony,positionz,nombre){
            

            var countrymaterials=[];

            countrymaterials=CreateTextureContry(nombre);

            var faceMaterial = new THREE.MeshFaceMaterial(countrymaterials);

            var cube_Geo = new THREE.BoxGeometry(1, 1, 1);
            
            var cube_Mesh = new THREE.Mesh(cube_Geo, faceMaterial);
            cube_Mesh.position.setX(positionx);
            cube_Mesh.position.setY(positiony);
            cube_Mesh.position.setZ(positionz);
            cube_Mesh.name = nombre;
            return cube_Mesh;
            }  


    function CreateTextureContry(name){

        textureLoader = new THREE.TextureLoader();

        var texture0 = textureLoader.load( '../img/'+name+'1.png' );
        var texture1 = textureLoader.load( '../img/'+name+'2.png' );
        var texture2 = textureLoader.load( '../img/'+name+'3.png' );
        var texture3 = textureLoader.load( '../img/'+name+'4.png' );
        var texture4 = textureLoader.load( '../img/'+name+'5.png' );
        var texture5 = textureLoader.load( '../img/'+name+'6.png' );

        materials = [
            new THREE.MeshBasicMaterial( { map: texture0 } ),
            new THREE.MeshBasicMaterial( { map: texture1 } ),
            new THREE.MeshBasicMaterial( { map: texture2 } ),
            new THREE.MeshBasicMaterial( { map: texture3 } ),
            new THREE.MeshBasicMaterial( { map: texture4 } ),
            new THREE.MeshBasicMaterial( { map: texture5 } )
        ];

        return materials;
    }
    
    function animate(){
        Cube1.rotation.y += 0.03;
        Cube2.rotation.y += 0.03;
        Cube3.rotation.y += 0.03;
        Cube4.rotation.y += 0.03;
        Cube5.rotation.y += 0.03;
        Cube6.rotation.y += 0.03;
        


        if(particles!=undefined){

            particles.position.y -= particleRotationSpeed;
        
          
          // We check if the color range has changed, if so, we'll change the colours
          if (lastColorRange[0] != currentColorRange[0] && lastColorRange[1] != currentColorRange[1]) {
            for (var i = 0; i < totalParticles; i++) {
                particles.children[i].material.color.setHSL(currentColorRange[0], currentColorRange[1], (Math.random() * (0.07 - 0.02) + 0.02));
            }
            lastColorRange = currentColorRange;
        // Render the scene through the manager.

        }

  
    }
        requestAnimationFrame( animate );
        render();
    }
    function render(){

        if ( player ){

            updateCameraPosition();

            checkKeyStates();

            //camera.lookAt(player.position);
        }
        controls.update();
        reticle.reticle_loop();
        checkKeyStates();
        //manager.render(scene, camera);
        effect.render(scene, camera);
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

    socket.on('LookingCube',function(Weather){

        Wea = SunCalc.getTimes(new Date(), Weather.Latitude,Weather.Longitud);
        p = SunCalc.getPosition(Wea.sunrise, Weather.Latitude,Weather.Longitud);
        FontLoaders = new THREE.FontLoader();
                    FontLoaders.load('../fonts/helvetiker_regular.typeface.js', function (font) {
                   // console.log(font);
                    InitFont(font,Weather.name);
                    InitAudio(Weather.name)
                    RequestTimeZone(font,Weather.Latitude,Weather.Longitud);
                });
        RequestOpenWeather(Weather.Latitude,Weather.Longitud);



    });

};

    
function SunCalculation(SunApi)
    {
        if(SunApi < 18 && SunApi > 6)
        {
            return Math.floor(Math.random() * (1-0.1+ 1)) + 0.1;  
            //console.log(SunApi.sunrise * SunApi.time);
        }
        return  0;  
        
    }

function GetTime(Hour)
                        {
                            effectController.luminance =SunCalculation(Hour);
                            console.log(effectController.luminance);
                            /*
                            $.ajax({
                             url: 'http://api.geonames.org/timezoneJSON',
                             data: {lat: latitude, lng: longitude, username: 'demo'},
                             success: function(Response){

                                //guiChanged(Response.time);
                               // console.log(Response);
                                effectController.luminance =SunCalculation(Response);
                                ///console.log(effectController.luminance);
                                
                             }
                            });*/
                        }
function guiChanged(value) {
                    //console.log(sky);
                    /*
                    var d = new Date(value)
                    var f = new Date();*/
                    console.log(effectController.luminance);
                    uniforms = sky.uniforms;
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
                    renderer.render( scene, camera );

                }

var createPlayer = function(data){

    var Coolors = new THREE.Color();
   // console.log(data);
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

   
    camera.position.x =player.position.x + 6 * Math.sin( player.rotation.y );
    camera.position.y =player.position.y + 6;
    camera.position.z =player.position.z + 6 * Math.cos( player.rotation.y );
    
    
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


    if (/*keyState[38] ||*/ keyState[87]) {
        // up arrow or 'w' - move forward
        player.position.x -= moveSpeed * Math.sin(player.rotation.y);
        player.position.z -= moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (/*keyState[40] ||*/ keyState[83]) {
        // down arrow or 's' - move backward
        player.position.x += moveSpeed * Math.sin(player.rotation.y);
        player.position.z += moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (/*keyState[37] ||*/ keyState[65]) {
        // left arrow or 'a' - rotate left
        player.rotation.y += turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (/*keyState[39] ||*/ keyState[68]) {
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
        
        camera.position.x = 15; 
        camera.position.y = 10; 
        camera.position.z = 8;  
        camera.lookAt( player.position ); 
    }

    if(keyState[71]){
       
        camera.position.x = 15; 
        camera.position.y = 10; 
        camera.position.z = -5;  
        camera.lookAt( player.position );
       
    }

     if(keyState[89]){

        camera.position.x = 8; 
        camera.position.y = 8; 
        camera.position.z = 8;  
        camera.lookAt( player.position );
    }

     if(keyState[72]){

        camera.position.x = 5; 
        camera.position.y = 20; 
        camera.position.z = 10;  
        camera.lookAt( player.position );
    }


    

};

var addOtherPlayer = function(data){
    var Coolors = new THREE.Color();
   // console.log(data);
    Coolors.setRGB(data.colorr,data.colorg,data.colorb);
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: Coolors.getHex(), wireframe: false});
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.x + Math.random()*7;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z + Math.random()*6;

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




