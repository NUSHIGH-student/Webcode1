import * as THREE from "three";

// 1. Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030510);

// 2. Create the camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 12;

// 3. Create the renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// 4. Create stars
const starGeometry = new THREE.BufferGeometry();
const starPositions = [];

for (let i = 0; i < 700; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60
    );
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0x8abfff,
    size: 0.08
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 5. Create floating buttons
const buttons = [];

function createButton(label, x, y, z) {

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 180;

    const ctx = canvas.getContext("2d");

    // Button background
    ctx.shadowColor = "#00ccff";
    ctx.shadowBlur = 25;

    ctx.fillStyle = "rgba(5, 25, 55, 0.9)";
    ctx.strokeStyle = "#37cfff";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.roundRect(12, 12, 488, 156, 25);
    ctx.fill();
    ctx.stroke();

    // Button text
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(label, 256, 90);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(3.6, 1.27);

    const button = new THREE.Mesh(geometry, material);

    button.position.set(x, y, z);

    button.userData = {
        label: label,
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2
    };

    scene.add(button);
    buttons.push(button);
}

// Add buttons to the universe
createButton("HOME", -4, 2, 0);
createButton("PROJECTS", 4, 2, -2);
createButton("ABOUT", -4, -2, -1);
createButton("CONTACT", 4, -2, 1);

// 6. Mouse interaction
const mouse = new THREE.Vector2(0, 0);

window.addEventListener("pointermove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// 7. Detect button clicks
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {

    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(buttons);

    if (hits.length > 0) {
        const name = hits[0].object.userData.label;

        document.getElementById("message").textContent =
            "You selected: " + name;
    }
});

// 8. Animate everything
const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    buttons.forEach((button) => {

        const data = button.userData;

        // Floating movement
        button.position.y =
            data.baseY + Math.sin(time * data.speed + data.phase) * 0.25;

        button.position.x =
            data.baseX + Math.cos(time * data.speed * 0.5 + data.phase) * 0.15;

        // Rotation
        button.rotation.z =
            Math.sin(time * 0.5 + data.phase) * 0.06;

        // React to mouse
        button.position.x += mouse.x * 1.5;
        button.position.y += mouse.y * 1.5;
    });

    // Camera follows mouse slightly
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.025;
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.025;

    camera.lookAt(0, 0, 0);

    // Slowly rotate the starfield
    stars.rotation.y = time * 0.015;

    renderer.render(scene, camera);
}

animate();

// 9. Handle window resizing
window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});
