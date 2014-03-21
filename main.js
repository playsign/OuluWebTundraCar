"use strict";

// For conditions of distribution and use, see copyright notice in LICENSE
/*
 *      @author Tapani Jamsa
 *      @author Erno Kuusela
 *      @author Toni Alatalo
 *      Date: 2014
 */

var app;
// var carSize; // TODO debug remove
var ground_material;
var useCamController = undefined;

// vehicle_benchmark_oulu

var gotCollisionCubes = function(cubes) {
    if (!cubes || !cubes.objects)
        return;
    var ncubes = 0;
    for (var key in cubes.objects) {
        if (!cubes.objects.hasOwnProperty(key))
            continue;
        if (key.indexOf("Collision") !== 0)
            return;
        var cubeProps = cubes.objects[key];
        addCollisionCube(cubeProps.position, cubeProps.rotation, cubeProps.scale);
        ncubes++;
    }
    console.log("found " + ncubes + " cubes");
};

var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ee00,
    wireframe: true,
    transparent: false
});

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function init() {
    app = new CarApp();
    var host = "10.10.2.7"; // hostname of the Tundra server
    var port = 2345; // and port to the server

    app.start();

    // loadCollisionCubes(gotCollisionCubes);

    loadXml3d(app.dataConnection, "WebTundra/examples/xml3d/xml3d-scene-jsonscene.html");

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Custom app specific properties
    app.dataConnection.loginData = {
        "name": Date.now().toString() + getRandomInt(0, 2000000).toString()
    };

    // STATS
    app.physics_stats = new Stats();
    app.physics_stats.domElement.style.position = 'absolute';
    app.physics_stats.domElement.style.bottom = '50px';
    app.physics_stats.domElement.style.zIndex = 100;
    app.viewer.container.appendChild(app.physics_stats.domElement);

    // GROUND

    ground_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture('images/rocks.jpg')
    }),
        0.8, // high friction
    .3 // low restitution
    );
    ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
    ground_material.map.repeat.set(3, 3);

    var ground = new Physijs.BoxMesh(
        new THREE.CubeGeometry(400, 1, 400),
        ground_material,
        0 // mass
    );
    ground.position.set(0, 6, 0);
    ground.rotation.set(0, 45, 0);
    ground.receiveShadow = true;
    app.viewer.scene.add(ground);

    // carSize = new Physijs.BoxMesh(
    //     new THREE.CubeGeometry(1, 4, 1),
    //     ground_material,
    //     0 // mass
    // );
    // carSize.position.set(0, 0, 0);
    // carSize.receiveShadow = true;
    // app.viewer.scene.add(carSize);

    // // FREE LOOK
    // var freeLookCtrl = new THREE.FreeLookControls(app.viewer.camera, app.viewer.renderer.domElement);
    // app.scene.add(freeLookCtrl.getObject());
    // // An object in freeLookCtrl that carries the camera. Set it's position instead of setting camera position directly
    // freeLookCtrl.getObject().position.set(0, 8.50, 28.50);

    app.connect(host, port);
}

function CarApp() {
    Application.call(this); // Super class
}

CarApp.prototype = new Application();

CarApp.prototype.constructor = CarApp;

CarApp.prototype.createViewer = function() {
    return new PhysijsView();
};

CarApp.prototype.logicUpdate = function(dt) {

    // PHYSICS

    // Fixed time step
    // app.viewer.scene.setFixedTimeStep(1 / 240);
    var timeStep = 1 / 60;
    var maxSubSteps = 5;
    this.viewer.scene.simulate(timeStep, maxSubSteps); // run physics
    // this.viewer.scene.simulate(); // run physics

    if (this.physics_stats) {
        this.physics_stats.update();
    }
};

// xml3D

function loadXml3d(model, docurl) {
    var parser = new SceneParser(model);
    parser.parseFromUrlXml3D(docurl);
    console.log("parse done");
}

function onSceneReady() {
    // var controls = new THREE.EditorControls(app.viewer.camera, app.viewer.renderer.domElement);

    // Car
    app.car = new Car(app, new THREE.Vector3(50, 8, -20));
    app.car.useCameraFollow = true;
}

// vehicle_benchmark_oulu

var gotCollisionCubes = function(cubes) {
    if (!cubes || !cubes.objects)
        return;
    var ncubes = 0;
    for (var key in cubes.objects) {
        if (!cubes.objects.hasOwnProperty(key))
            continue;
        if (key.indexOf("Collision") !== 0)
            return;
        var cubeProps = cubes.objects[key];
        addCollisionCube(cubeProps.position, cubeProps.rotation, cubeProps.scale);
        ncubes++;
    }
    console.log("found " + ncubes + " cubes");
};

var wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ee00,
    wireframe: true,
    transparent: false
});

var lastCube = null;

function addCollisionCube(pos, rot, scale) {
    console.log(scale);
    var box = new Physijs.BoxMesh(new THREE.CubeGeometry(2, 2, 2), wireframeMaterial, 0);
    box.scale.set(scale[0], scale[1], scale[2]);
    box.rotation.set(rot[0], rot[1], rot[2]);
    box.position.set(pos[0], pos[1], pos[2]);
    app.viewer.scene.add(box);
    if (!lastCube) {
        lastCube = box;
        console.log("pos " + pos.x + " vs " + lastCube.position.x);
    }

    // createEntityWithRigidbody(pos, rot, scale);
}

// var loadCollisionGeometry = function() {
//     var loader = new THREE.JSONLoader();
//     console.log("c loader start");
//     loader.load("ColliderBuildings.js", function(buildings, building_materials) {
//         var wireframeMaterial = new THREE.MeshBasicMaterial({
//             color: 0x00ee00,
//             wireframe: true,
//             transparent: false
//         });

//         var mesh = new Physijs.ConvexMesh(
//             buildings,
//             wireframeMaterial new THREE.MeshFaceMaterial( building_materials )  ,
//             0);
//         console.log("c loader finish");
//         ocmesh = mesh;
//         ocmesh.castShadow = ocmesh.receiveShadow = true;
//         //ocmesh.scale.set(0.1, 0.1, 0.1);
//         ocmesh.position.set(
//             Math.random() * 25 - 50,
//             30,
//             Math.random() * 25 - 50);
//         window.setTimeout(function() {
//             app.viewer.scene.add(ocmesh)
//         }, 800);
//     });
// };

function loadCollisionCubes(callback) {
    var req = new XMLHttpRequest();
    req.open("GET", "oulucollcubes.json", true);
    req.onreadystatechange = function(evt) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                console.log("yay");
                try {
                    var decoded = JSON.parse(req.responseText);
                } catch (err) {
                    console.log("bad json: " + err);
                    callback(null);
                }
                callback(decoded);
            } else {
                console.log("no load");
            }
        }
    };
    req.send(null);
}

function createEntityWithRigidbody(pos, rot, scale) {
    var entity = app.dataConnection.scene.createEntity(0, AttributeChange.Default);
    entity.name = "CollisionBox";

    // PLACEABLE

    var placeable = entity.createComponent(0, cComponentTypePlaceable,
        "", AttributeChange.Default);
    var newTransform = placeable.transform;

    // Position
    newTransform.pos.x = pos[0];
    newTransform.pos.y = pos[1];
    newTransform.pos.z = pos[2];

    // Rotation
    // newTransform.rot.x = Math.degrees(rot[0]);
    // newTransform.rot.y = Math.degrees(rot[1]);
    // newTransform.rot.z = Math.degrees(rot[2]);

    // Scale
    newTransform.scale.x = scale[0];
    newTransform.scale.y = scale[2];
    newTransform.scale.z = scale[1];


    // RIGIDBODY

    var rigidbody = entity.createComponent(0, cComponentTypeRigidBody,
        "", AttributeChange.Default);
    rigidbody.parentRef = 0; // won't get added to three scene until this is initialized
    rigidbody.kinematic = true;
    rigidbody.drawDebug = true;
    rigidbody.size = { x: 1.0, y: 1.0, z: 1.0 };

    return entity;
};


window.setTimeout(onSceneReady, 2000);

init();
