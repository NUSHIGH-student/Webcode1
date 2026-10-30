
import * as THREE from "three";

// ==========================================
// 1. CREATE THE SCENE
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030510);

// ==========================================
// 2. CREATE THE CAMERA
// ==========================================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 12;

// ==========================================
// 3. CREATE THE RENDERER
// ==========================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// ==========================================
// 4. CREATE STARS
// ==========================================

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

// ==========================================
// 5. CREATE FLOATING BUTTONS
// ==========================================

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

    // Button physics properties
    button.userData = {

        label: label,

        baseX: x,
        baseY: y,
        baseZ: z,

        speed: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,

        vx: 0,
        vy: 0,

        offsetX: 0,
        offsetY: 0

    };

    scene.add(button);
    buttons.push(button);

}

// Add buttons
createButton("HOME", -4, 2, 0);
createButton("PROJECTS", 4, 2, -2);
createButton("ABOUT", -4, -2, -1);
createButton("CONTACT", 4, -2, 1);

// ==========================================
// 6. MOUSE INTERACTION
// ==========================================

const mouse = new THREE.Vector2(0, 0);

window.addEventListener("pointermove", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

});

// ==========================================
// 7. BUTTON CLICK DETECTION
// ==========================================

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

// ==========================================
// 8. PHYSICS SETTINGS
// ==========================================

const stiffness = 8;
const damping = 3;
const mouseForce = 5;
const interactionRadius = 4;

const clock = new THREE.Clock();

// ==========================================
// 9. ANIMATION
// ==========================================

function animate() {

    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.03);
    const time = clock.elapsedTime;

    buttons.forEach((button) => {

        const data = button.userData;

        // Mouse position
        const mouseX = mouse.x * 6;
        const mouseY = mouse.y * 4;

        // Distance between mouse and button
        const dx = button.position.x - mouseX;
        const dy = button.position.y - mouseY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // Mouse repulsion
        let forceX = 0;
        let forceY = 0;

        if (distance < interactionRadius && distance > 0.001) {

            const strength =
                (interactionRadius - distance) * mouseForce;

            forceX = (dx / distance) * strength;
            forceY = (dy / distance) * strength;

        }

        // Spring force
        const springX = -stiffness * data.offsetX;
        const springY = -stiffness * data.offsetY;

        // Damping force
        const dampingX = -damping * data.vx;
        const dampingY = -damping * data.vy;

        // Acceleration
        const ax = springX + dampingX + forceX;
        const ay = springY + dampingY + forceY;

        // Velocity
        data.vx += ax * dt;
        data.vy += ay * dt;

        // Displacement
        data.offsetX += data.vx * dt;
        data.offsetY += data.vy * dt;

        // Natural floating movement
        const floatY =
            Math.sin(time * data.speed + data.phase) * 0.25;

        const floatX =
            Math.cos(time * data.speed * 0.5 + data.phase) * 0.15;

        // Update position
        button.position.x =
            data.baseX + floatX + data.offsetX;

        button.position.y =
            data.baseY + floatY + data.offsetY;

        // Button rotation
        button.rotation.z = -data.vx * 0.08;
        button.rotation.y = -data.offsetX * 0.12;
        button.rotation.x = data.offsetY * 0.1;

    });

    // Camera follows mouse
    camera.position.x +=
        (mouse.x * 2 - camera.position.x) * 0.05;

    camera.position.y +=
        (mouse.y * 1.5 - camera.position.y) * 0.05;

    camera.lookAt(0, 0, 0);

    // Rotate starfield
    stars.rotation.y = time * 0.015;

    // Render
    renderer.render(scene, camera);

}

animate();

// ==========================================
// 10. WINDOW RESIZING
// ==========================================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

});
