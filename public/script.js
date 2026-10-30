
import * as THREE from "three";

// ==========================================
// 1. SCENE, CAMERA AND RENDERER
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030510);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();


// ==========================================
// 2. ORIGINAL BACKGROUND STARFIELD
// ==========================================

const starGeometry = new THREE.BufferGeometry();
const starCount = 700;

const starPositions = [];

for (let i = 0; i < starCount; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0x8bbcff,
    size: 0.08,
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);


// ==========================================
// 3. DYNAMIC STARS
// ==========================================

const dynamicStars = [];

function spawnStar(star, initial = false) {

    star.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 22,
        -Math.random() * 70 - 10
    );

    star.userData.lifetime = 4 + Math.random() * 8;

    star.userData.age = initial
        ? Math.random() * star.userData.lifetime
        : 0;

    star.userData.speed = 1 + Math.random() * 3;
}

for (let i = 0; i < 150; i++) {

    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false
    });

    const star = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.025 + Math.random() * 0.035,
            6,
            6
        ),
        material
    );

    scene.add(star);

    star.userData = {
        age: 0,
        lifetime: 5,
        speed: 2
    };

    spawnStar(star, true);

    dynamicStars.push(star);
}


// ==========================================
// 4. GALAXY TEXTURE
// ==========================================

function createGalaxyTexture() {

    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        256, 256, 5,
        256, 256, 220
    );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,0.95)"
    );

    gradient.addColorStop(
        0.12,
        "rgba(150,180,255,0.65)"
    );

    gradient.addColorStop(
        0.35,
        "rgba(100,80,255,0.25)"
    );

    gradient.addColorStop(
        1,
        "rgba(20,10,80,0)"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    ctx.translate(256, 256);

    for (let arm = 0; arm < 3; arm++) {

        ctx.save();

        ctx.rotate((Math.PI * 2 / 3) * arm);

        ctx.beginPath();

        ctx.moveTo(0, 0);

        ctx.bezierCurveTo(
            40, -20,
            100, -150,
            220, -100
        );

        ctx.strokeStyle = "rgba(150,180,255,0.35)";
        ctx.lineWidth = 18;
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#7777ff";

        ctx.stroke();

        ctx.restore();
    }

    return new THREE.CanvasTexture(canvas);
}


// ==========================================
// 5. GALAXIES THAT SPAWN AND DIE
// ==========================================

const galaxyTexture = createGalaxyTexture();

const galaxies = [];

function spawnGalaxy(galaxy, initial = false) {

    galaxy.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 20,
        -Math.random() * 60 - 25
    );

    galaxy.userData.lifetime = 20 + Math.random() * 25;

    galaxy.userData.age = initial
        ? Math.random() * galaxy.userData.lifetime
        : 0;

    galaxy.userData.speed = 0.1 + Math.random() * 0.2;

    galaxy.material.opacity = 0;
}

for (let i = 0; i < 5; i++) {

    const material = new THREE.SpriteMaterial({
        map: galaxyTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const galaxy = new THREE.Sprite(material);

    galaxy.scale.set(
        5 + Math.random() * 4,
        3 + Math.random() * 3,
        1
    );

    scene.add(galaxy);

    galaxy.userData = {
        age: 0,
        lifetime: 30,
        speed: 0.15
    };

    spawnGalaxy(galaxy, true);

    galaxies.push(galaxy);
}


// ==========================================
// 6. FLOATING INTERACTIVE BUTTONS
// ==========================================

const buttons = [];

function createButton(label, x, y, z) {

    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 180;

    const ctx = canvas.getContext("2d");

    // Button background

    ctx.fillStyle = "rgba(10, 25, 55, 0.85)";

    ctx.beginPath();

    ctx.roundRect(10, 10, 492, 160, 30);

    ctx.fill();

    // Button border

    ctx.strokeStyle = "#8be9ff";
    ctx.lineWidth = 5;

    ctx.stroke();

    // Button glow

    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00aaff";

    ctx.stroke();

    ctx.shadowBlur = 0;

    // Button text

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 55px Arial";
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

        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,

        vx: 0,
        vy: 0,

        offsetX: 0,
        offsetY: 0
    };

    scene.add(button);

    buttons.push(button);
}

createButton("NEW GAME", -4, 2, 0);
createButton("ACHIEVEMENTS", 4, 2, -2);
createButton("LOG IN", -4, -2, -1);
createButton("LEADERBOARD", 4, -2, 1);


// ==========================================
// 7. MOUSE INTERACTION
// ==========================================

const mouse = new THREE.Vector2();

window.addEventListener("pointermove", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

});


// ==========================================
// 8. SECTION SCREENS AND FLASH TRANSITION
// ==========================================

// Flash overlay

const flashOverlay = document.createElement("div");

flashOverlay.style.position = "fixed";
flashOverlay.style.inset = "0";
flashOverlay.style.background = "white";
flashOverlay.style.opacity = "0";
flashOverlay.style.pointerEvents = "none";
flashOverlay.style.zIndex = "10000";
flashOverlay.style.transition = "opacity 0.13s ease";

document.body.appendChild(flashOverlay);


// Section screen

const segmentScreen = document.createElement("div");

segmentScreen.style.position = "fixed";
segmentScreen.style.inset = "0";
segmentScreen.style.display = "none";
segmentScreen.style.flexDirection = "column";
segmentScreen.style.alignItems = "center";
segmentScreen.style.justifyContent = "center";

segmentScreen.style.background =
    "radial-gradient(circle at center, #101c45, #030510 75%)";

segmentScreen.style.color = "white";
segmentScreen.style.fontFamily = "Arial, sans-serif";
segmentScreen.style.zIndex = "9999";
segmentScreen.style.textAlign = "center";
segmentScreen.style.padding = "30px";

document.body.appendChild(segmentScreen);


// Section content

const sectionContent = {

    "NEW GAME": {
        title: "NEW GAME",
        description: "Your journey begins here."
    },

    "ACHIEVEMENTS": {
        title: "ACHIEVEMENTS",
        description: "Discover the milestones you have accomplished."
    },

    "LOG IN": {
        title: "LOG IN",
        description: "Sign-in functionality will be added here."
    },

    "LEADERBOARD": {
        title: "LEADERBOARD",
        description: "See how you rank against other players."
    }

};


// Section title

const sectionTitle = document.createElement("h1");

sectionTitle.style.fontSize = "48px";
sectionTitle.style.letterSpacing = "6px";
sectionTitle.style.color = "#8be9ff";
sectionTitle.style.textShadow = "0 0 25px #00aaff";


// Section description

const sectionDescription = document.createElement("p");

sectionDescription.style.fontSize = "18px";
sectionDescription.style.color = "#aabbd0";
sectionDescription.style.marginTop = "20px";


// Back button

const backButton = document.createElement("button");

backButton.textContent = "← BACK TO SPACE";

backButton.style.marginTop = "45px";
backButton.style.padding = "15px 30px";
backButton.style.border = "2px solid #8be9ff";
backButton.style.borderRadius = "12px";
backButton.style.background = "rgba(10, 25, 55, 0.8)";
backButton.style.color = "white";
backButton.style.fontSize = "16px";
backButton.style.letterSpacing = "2px";
backButton.style.cursor = "pointer";
backButton.style.boxShadow = "0 0 20px #0077ff";

segmentScreen.appendChild(sectionTitle);
segmentScreen.appendChild(sectionDescription);
segmentScreen.appendChild(backButton);


// ==========================================
// 9. FLASH TRANSITION FUNCTION
// ==========================================

let transitioning = false;

function flashTransition(callback) {

    if (transitioning) return;

    transitioning = true;

    flashOverlay.style.opacity = "1";

    setTimeout(() => {

        callback();

        flashOverlay.style.opacity = "0";

        setTimeout(() => {

            transitioning = false;

        }, 200);

    }, 130);

}


// ==========================================
// 10. OPEN A SECTION
// ==========================================

function openSegment(label) {

    const section = sectionContent[label];

    if (!section) return;

    flashTransition(() => {

        sectionTitle.textContent = section.title;

        sectionDescription.textContent = section.description;

        segmentScreen.style.display = "flex";

    });

}


// ==========================================
// 11. RETURN TO SPACE
// ==========================================

backButton.addEventListener("click", (event) => {

    event.stopPropagation();

    flashTransition(() => {

        segmentScreen.style.display = "none";

    });

});


// ==========================================
// 12. BUTTON CLICK DETECTION
// ==========================================

const raycaster = new THREE.Raycaster();

window.addEventListener("click", () => {

    if (transitioning) return;

    if (segmentScreen.style.display === "flex") return;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(buttons);

    if (intersections.length > 0) {

        const selectedButton = intersections[0].object;

        openSegment(selectedButton.userData.label);

    }

});


// ==========================================
// 13. ANIMATION LOOP
// ==========================================

function animate() {

    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.03);

    const time = clock.elapsedTime;


    // --------------------------------------
    // DYNAMIC STAR ANIMATION
    // --------------------------------------

    dynamicStars.forEach(star => {

        star.userData.age += dt;

        const progress =
            star.userData.age / star.userData.lifetime;

        star.material.opacity = Math.sin(progress * Math.PI);

        star.position.z += star.userData.speed * dt;

        if (star.userData.age >= star.userData.lifetime) {

            spawnStar(star);

        }

    });


    // --------------------------------------
    // GALAXY ANIMATION
    // --------------------------------------

    galaxies.forEach(galaxy => {

        galaxy.userData.age += dt;

        const progress =
            galaxy.userData.age / galaxy.userData.lifetime;

        galaxy.material.opacity =
            0.3 * Math.sin(progress * Math.PI);

        galaxy.position.z += galaxy.userData.speed * dt;

        galaxy.position.x +=
            Math.sin(time * 0.15) * 0.002;

        galaxy.material.rotation += dt * 0.025;

        if (galaxy.userData.age >= galaxy.userData.lifetime) {

            spawnGalaxy(galaxy);

        }

    });


    // --------------------------------------
    // SPRING PHYSICS FOR BUTTONS
    // --------------------------------------

    const stiffness = 8;
    const damping = 3;
    const mouseForce = 5;
    const interactionRadius = 4;

    buttons.forEach(button => {

        const data = button.userData;

        const mouseX = mouse.x * 6;
        const mouseY = mouse.y * 4;

        const dx = button.position.x - mouseX;
        const dy = button.position.y - mouseY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        let forceX = 0;
        let forceY = 0;

        if (
            distance < interactionRadius &&
            distance > 0.001
        ) {

            const strength =
                (interactionRadius - distance) * mouseForce;

            forceX = (dx / distance) * strength;
            forceY = (dy / distance) * strength;

        }

        const springX = -stiffness * data.offsetX;
        const springY = -stiffness * data.offsetY;

        const dampingX = -damping * data.vx;
        const dampingY = -damping * data.vy;

        const ax = springX + dampingX + forceX;
        const ay = springY + dampingY + forceY;

        data.vx += ax * dt;
        data.vy += ay * dt;

        data.offsetX += data.vx * dt;
        data.offsetY += data.vy * dt;

        const floatY =
            Math.sin(time * data.speed + data.phase) * 0.25;

        const floatX =
            Math.cos(time * data.speed * 0.5 + data.phase) * 0.15;

        button.position.x =
            data.baseX + floatX + data.offsetX;

        button.position.y =
            data.baseY + floatY + data.offsetY;

        button.rotation.z = -data.vx * 0.08;
        button.rotation.y = -data.offsetX * 0.12;
        button.rotation.x = data.offsetY * 0.1;

    });


    // --------------------------------------
    // CAMERA PARALLAX
    // --------------------------------------

    camera.position.x +=
        (mouse.x * 0.5 - camera.position.x) * 0.03;

    camera.position.y +=
        (mouse.y * 0.5 - camera.position.y) * 0.03;


    // --------------------------------------
    // ORIGINAL STARFIELD ROTATION
    // --------------------------------------

    stars.rotation.y += 0.0002;
    stars.rotation.x += 0.0001;


    // --------------------------------------
    // RENDER
    // --------------------------------------

    renderer.render(scene, camera);

}

animate();


// ==========================================
// 14. WINDOW RESIZE
// ==========================================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

});
