/**
 * Created by mukulhase on 3/27/16.
 */
var coinradius = [1.75,1.75,2,1.75];
var hold = {};
var speed=0;
var materials = [];
var objects = [];
var coins = [];
var scale = 10;
var s = scale;
var temp = [];
var stricker;
var gameState="default";
var pointer;
var timer=5;
var points=100;
var active=false;
var red=-1;
window.addEventListener("keyup", keyboardUP, false);
window.addEventListener("keydown", keyboardDOWN, false);
var good = new Audio("good.mp3"); // buffers automatically when created
var bad = new Audio("bad.mp3");
dataLoader();
loadGame();
function speedBarUpdate(){
    $( "#speedBar" ).progressbar({
        value: speed*2
    });
}

setInterval(update,5);
function update(){
    coinRender();
    speedBarUpdate();
    switch (gameState){
        case "stricker":
            if(pointer){
                scene.remove(pointer);
            }
            if(hold['l'])
                moveStricker("l");
            if(hold['r'])
                moveStricker("r");
            if(hold['u'])
                speedChange('u');
            if(hold['d'])
                speedChange("d");
            var geometry = new THREE.Geometry();
            var material = new THREE.LineBasicMaterial({
                color: 0xFF0000,
                linewidth: 1,
                fog:true
            });
            geometry.vertices.push(new THREE.Vector3( coins[stricker].x, 2.5, coins[stricker].z ));
            geometry.vertices.push(new THREE.Vector3( coins[stricker].x + (coins[stricker].x - camera.position.x)*10, 2.5, coins[stricker].z + (coins[stricker].z - camera.position.z)*10));
            pointer = new THREE.Line(geometry, material);
            scene.add(pointer);
            break;
    }
}
function changeView(arg){
    gameState=arg;
    if(pointer){
        scene.remove(pointer);
    }
    switch (arg){
        case "stricker":
            // controls, camera
            controls.target.set( coins[stricker].x, 0, coins[stricker].z );
            camera.position.set( coins[stricker].x, 200, coins[stricker].z+300 );
            controls.update();
            break;
        case "default":
            controls.target.set( 0, 0, 0 );
            camera.position.set( 0, 500, 700 );
            controls.update();
    }
}
function dataLoader() {
    var textureLoader = new THREE.TextureLoader();
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("carrom.json", function ( obj ) {
        objects[0]=obj;
        ready--;
    });
    textureLoader.load('MAP/board.png', function (texture) {
        materials[5] = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true
        });
        ready--;
    });
    textureLoader.load('MAP/black coin.jpg', function (texture) {
        materials[0] = new THREE.MeshPhongMaterial({map: texture});
        ready--;
    });
    textureLoader.load('MAP/white_coin.jpg', function (texture) {
        materials[1] = new THREE.MeshPhongMaterial({map: texture});
        ready--;
    });
    textureLoader.load('MAP/red.jpg', function (texture) {
        materials[3] = new THREE.MeshPhongMaterial({map: texture});
        ready--;
    });
    textureLoader.load('MAP/Stricker.jpg', function (texture) {
        materials[2] = new THREE.MeshPhongMaterial({map: texture});
        ready--;
    });

}
function updateCoinPos(){
    for(var coin in coins){
        coins[coin].lGP.x= coins[coin].x;
        coins[coin].lGP.z= coins[coin].z;

        coins[coin].x+=coins[coin].vx;
        coins[coin].z+=coins[coin].vz;
    }
}
function scoreChange(color){
    switch(color){
        case 3:
            red=2;
            break;
        case 1:
            good.play();
            points+=5;
            if(red>=0){
                points+=20;
                red=0;
            }
            break;
        case 2:
            bad.play();
            points-=20;
            break;
        case 0:
            bad.play();
            points -=20;
            break;
    }
}
function checkDrop(){

    var thresh = 330;
    for(var coin in coins){
        if(Math.abs(coins[coin].x)>thresh && Math.abs(coins[coin].z)>thresh){
            scoreChange(coins[coin].c);
            if(coin<stricker){
                scene.remove(temp[coin]);
                coins.splice(coin,1);
                temp.splice(coin,1);
                coin--;
                stricker--;
            }else if(coin==stricker){
                setStricker();
            }else if(coin>stricker){
                scene.remove(temp[coin]);
                coins.splice(coin,1);
                temp.splice(coin,1);
                coin--;
            }
        }
    }
}
function coinRender(){
    checkDrop();
    updateCoinPos();
    checkWallCollision(coins);
    var ballArray = coins;
    for (var i in ballArray) {
        for (var j in ballArray) {
            if (ballArray[i] != ballArray[j]) {
                if (checkBallCollision(i, j)) {
                    ballCollisionResponse(i, j);
                }
            }
        }
    }
    for(var coin in coins){
        temp[coin].position.x=coins[coin].x;
        temp[coin].position.z=coins[coin].z;
    }
    //friction
    var friction = 0.1;
    for(var coin in coins){
        var angle = Math.atan2(coins[coin].vx,coins[coin].vz);
        if(coins[coin].vx > (friction * Math.abs(Math.sin(angle))))
            coins[coin].vx-=(friction * Math.abs(Math.sin(angle)));
        if(coins[coin].vx < -(friction * Math.abs(Math.sin(angle))))
            coins[coin].vx+=(friction * Math.abs(Math.sin(angle)));
        if(coins[coin].vx < (friction * Math.abs(Math.sin(angle))) && coins[coin].vx > -(friction * Math.abs(Math.sin(angle))))
            coins[coin].vx=0;
        if(coins[coin].vz > (friction * Math.abs(Math.cos(angle))))
            coins[coin].vz-=(friction * Math.abs(Math.cos(angle)));
        if(coins[coin].vz < -(friction * Math.abs(Math.cos(angle))))
            coins[coin].vz+=(friction * Math.abs(Math.cos(angle)));
        if(coins[coin].vz < (friction * Math.abs(Math.cos(angle))) && coins[coin].vz > -(friction * Math.abs(Math.cos(angle))))
            coins[coin].vz=0;
    }
    var check = true;
    for(var coin in coins){
        if(coins[coin].vx !=0 || coins[coin].vz!=0){
            check = false;
            break;
        }
    }
    if(check && active){
        setStricker();
    }
}
function setStricker(){
    red--;
    console.log("red"+ red);
    if(red==0){
        createCoin(0,0,3);
    }

    active=false;
    coins[stricker].x = 0;
    coins[stricker].z = 250;
    coins[stricker].vx = 0;
    coins[stricker].vz = 0;
    changeView("stricker");
}
function loadGame(){
    var l = setInterval(function(){
        console.log("check");
        if(ready==0){
            clearInterval(l);
            var geo = new THREE.BoxGeometry( 755, 1, 755 );
            var cube = new THREE.Mesh( geo, materials[5] );
            scene.add(cube);
            var obj = objects[0];
            obj.position.x -= 10;
            obj.position.z -= 10;
            obj.rotation.y += 40 * Math.PI / 180;
            scene.add( obj );
            placeCoins();
        }
    },1000);

}
function createCoin(x,z,c){
    coin = {};
    coin['x']=x;
    coin['z']=z;
    coin['c']=c;
    coin['vx']=0;
    coin['vz']=0;
    coin['rad']=coinradius[c];
    coin['lGP']={x:x,z:z};
    cylinder = new THREE.CylinderGeometry(coinradius[c] * s, coinradius[c] * s, 10, 32);
    index=coins.length;
    temp[index] = new THREE.Mesh(cylinder, materials[c]);
    scene.add(temp[index]);
    return coins.push(coin);
}
function placeCoins(){
    cr = coinradius[0]*s;
    createCoin(0,0,3);
    createCoin(4*cr,0,1);
    createCoin(-4*cr,0,1);
    createCoin(0,4*cr,1);
    createCoin(0,-4*cr,1);
    createCoin((-4/1.41)*cr,(-4/1.41)*cr,0);
    createCoin((4/1.41)*cr,(-4/1.41)*cr,0);
    createCoin((4/1.41)*cr,(4/1.41)*cr,0);
    createCoin((-4/1.41)*cr,(4/1.41)*cr,0);
    stricker = createCoin(0,250,2) - 1;
}
function speedChange(arg){
    switch(arg){
        case "u":
            if(speed<50)
                speed+=0.5;
            break;
        case "d":
            if(speed>0)
                speed-=0.5;
            break;
    }
}
function moveStricker(arg){
    switch(arg){
        case "l":
            if(coins[stricker].x>-230)
                coins[stricker].x--;
            break;
        case "r":
            if(coins[stricker].x<230)
                coins[stricker].x++;
            break;
    }
    controls.target.set( coins[stricker].x, 0, coins[stricker].z );
    controls.update();
}
function shootStricker(){
    var s= speed;
    var angle = Math.atan2((coins[stricker].x - camera.position.x),(coins[stricker].z - camera.position.z));
    coins[stricker].vx=s*Math.sin(angle);
    coins[stricker].vz=s*Math.cos(angle);
    active = true;
}
function keyboardUP(e){
    console.log(e.keyCode);
    switch (e.keyCode){
        case 38:
            hold['u']=false;
            break;
        case 40:
            hold['d']=false;
            break;
        case 37:
            hold['l']=false;
            break;
        case 39:
            hold['r']=false;
            break;
        case 65:
            changeView("stricker");
            break;
        case 66:
            changeView("default");
            break;
        case 67:
            console.log(coins, temp);
            break;
        case 32:
            shootStricker();
    }
}
function keyboardDOWN(e){
    switch (e.keyCode){
        case 38:
            hold['u']=true;
            break;
        case 40:
            hold['d']=true;
            break;
        case 37:
            hold['l']=true;
            break;
        case 39:
            hold['r']=true;
            break;
    }
}
function checkWallCollision(coins) {
    var canvas_Width=375;
    var canvas_Height=375;
    ballArray = coins;
    for (var i in ballArray) {
        if (ballArray[i].x + ballArray[i].rad >= canvas_Width || ballArray[i].x - ballArray[i].rad <= -canvas_Width) {
            ballArray[i].vx=-ballArray[i].vx;
            ballArray[i].position = ballArray[i].lGP.x;
        }
        if (ballArray[i].z - ballArray[i].rad <= -canvas_Height || ballArray[i].z + ballArray[i].rad >= canvas_Height) {
            ballArray[i].vz=-ballArray[i].vz;
            ballArray[i].z = ballArray[i].lGP.z;
        }
    }
}
function checkBallCollision(arg1, arg2) {
    ball1 = coins[arg1];
    ball2 = coins[arg2];
    var xDistance = (ball2.x - ball1.x);
    var yDistance = (ball2.z - ball1.z);
    var distanceBetween = Math.sqrt((xDistance * xDistance) + (yDistance *yDistance));

    var sumOfRadius = ((coinradius[ball1.c]+coinradius[ball2.c])*s); // add the balls radius together

    return distanceBetween < sumOfRadius;
}
function ballCollisionResponse(arg1, arg2) {
    ball1 = coins[arg1];
    ball2 = coins[arg2];
    ball1mass = 1;
    ball2mass = 1;
    if(ball1.c==2)ball1mass=1.5;
    if(ball2.c==2)ball2mass=1.5;
    ball1velocity = new vector(ball1.vx,ball1.vz);
    ball2velocity = new vector(ball2.vx,ball2.vz);
    var xDistance = (ball2.x - ball1.x);
    var yDistance = (ball2.z - ball1.z);

    var normalVector = new vector(xDistance, yDistance); // normalise this vector store the return value in normal vector.
    normalVector = normalVector.normalise();

    var tangentVector = new vector((normalVector.getY() * -1), normalVector.getX());

    // create ball scalar normal direction.
    var ball1scalarNormal =  normalVector.dot(ball1velocity);
    var ball2scalarNormal = normalVector.dot(ball2velocity);

    // create scalar velocity in the tagential direction.
    var ball1scalarTangential = tangentVector.dot(ball1velocity);
    var ball2scalarTangential = tangentVector.dot(ball2velocity);

    var ball1ScalarNormalAfter = (ball1scalarNormal * (ball1mass - ball2mass) + 2 * ball2mass * ball2scalarNormal) / (ball1mass + ball2mass);
    var ball2ScalarNormalAfter = (ball2scalarNormal * (ball2mass - ball1mass) + 2 * ball1mass * ball1scalarNormal) / (ball1mass + ball2mass);

    var ball1scalarNormalAfter_vector = normalVector.multiply(ball1ScalarNormalAfter); // ball1Scalar normal doesnt have multiply not a vector.
    var ball2scalarNormalAfter_vector = normalVector.multiply(ball2ScalarNormalAfter);

    var ball1ScalarNormalVector = (tangentVector.multiply(ball1scalarTangential));
    var ball2ScalarNormalVector = (tangentVector.multiply(ball2scalarTangential));

    ball1velocity = ball1ScalarNormalVector.add(ball1scalarNormalAfter_vector);
    ball2velocity = ball2ScalarNormalVector.add(ball2scalarNormalAfter_vector);
    ball1.vx = ball1velocity.getX();
    ball1.vz = ball1velocity.getY();
    ball2.vx = ball2velocity.getX();
    ball2.vz = ball2velocity.getY();

    ball1.x = ball1.lGP.x;
    ball1.z = ball1.lGP.z;
    ball2.x = ball2.lGP.x;
    ball2.z = ball2.lGP.z;
}
setInterval(function(){
    document.getElementById("points").innerHTML=points;
    timer--;
    if(timer==0){
        timer=5;
        points-=1;
    }
},1000);