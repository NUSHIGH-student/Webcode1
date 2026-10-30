
import * as THREE from "three";

export function startSpaceGame(container) {
    container.innerHTML = "";

    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "hidden";
    container.style.background = "#050914";

    // ==========================================
    // 1. SCENE, CAMERA AND RENDERER
    // ==========================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.Fog(0x050914, 35, 100);

    const camera = new THREE.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.1,
        200
    );

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // ==========================================
    // 2. LIGHTING
    // ==========================================

    scene.add(new THREE.AmbientLight(0x9bbcff, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x168cff, 100, 35);
    blueLight.position.set(-12, 5, -10);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x913cff, 100, 35);
    purpleLight.position.set(12, 5, 10);
    scene.add(purpleLight);

    // ==========================================
    // 3. MATERIALS
    // ==========================================

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x172438,
        metalness: 0.75,
        roughness: 0.35
    });

    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x26364c,
        metalness: 0.7,
        roughness: 0.4
    });

    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x176a9b,
        metalness: 0.6,
        roughness: 0.3
    });

    const glowMat = new THREE.MeshStandardMaterial({
        color: 0x36caff,
        emissive: 0x0875ff,
        emissiveIntensity: 2
    });

    // ==========================================
    // 4. BOX CREATION AND COLLISION
    // ==========================================

    const solidBoxes = [];

    function addBox(x, y, z, sx, sy, sz, material) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(sx, sy, sz),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        return mesh;
    }

    function addSolidBox(x, y, z, sx, sy, sz, material) {
        const mesh = addBox(x, y, z, sx, sy, sz, material);

        solidBoxes.push({
            x,
            z,
            halfX: sx / 2,
            halfZ: sz / 2,
            minY: y - sy / 2,
            maxY: y + sy / 2
        });

        return mesh;
    }

    // ==========================================
    // 5. SPACESHIP FLOOR
    // ==========================================

    addBox(0, -0.5, 0, 70, 1, 50, floorMat);

    // ==========================================
    // 6. OUTER WALLS
    // ==========================================

    addBox(0, 5, -25, 70, 10, 1, wallMat);
    addBox(0, 5, 25, 70, 10, 1, wallMat);
    addBox(-35, 5, 0, 1, 10, 50, wallMat);
    addBox(35, 5, 0, 1, 10, 50, wallMat);

    // ==========================================
    // 7. INTERIOR WALLS
    // ==========================================

    addSolidBox(-12, 4, -10, 1, 8, 20, wallMat);
    addSolidBox(12, 4, 10, 1, 8, 20, wallMat);

    // ==========================================
    // 8. REACTOR STRUCTURES
    // ==========================================

    for (let i = -2; i <= 2; i++) {

        addSolidBox(
            i * 5,
            4,
            -20,
            2,
            8,
            2,
            wallMat
        );

        addBox(
            i * 5,
            7,
            -18.8,
            0.25,
            0.25,
            0.25,
            glowMat
        );
    }

    // ==========================================
    // 9. PARKOUR PLATFORMS
    // ==========================================

    const platforms = [];

    function addPlatform(x, top, z, width, depth) {

        addSolidBox(
            x,
            top / 2,
            z,
            width,
            top,
            depth,
            platformMat
        );

        platforms.push({
            x,
            z,
            halfX: width / 2,
            halfZ: depth / 2,
            top
        });
    }

    addPlatform(-7, 1.2, 4, 5, 5);
    addPlatform(-13, 2.2, 0, 4, 4);
    addPlatform(-19, 3.2, -5, 4, 4);
    addPlatform(-24, 4.2, -10, 5, 5);

    addPlatform(8, 1.2, -2, 5, 5);
    addPlatform(14, 2.2, -7, 4, 4);
    addPlatform(20, 3.2, -12, 4, 4);

    // ==========================================
    // 10. PLAYER CHARACTER
    // ==========================================

    const player = new THREE.Group();
    scene.add(player);

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xe4ad85,
        roughness: 0.8
    });

    const suitMat = new THREE.MeshStandardMaterial({
        color: 0x263e67,
        metalness: 0.35,
        roughness: 0.55
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x101b2b,
        metalness: 0.4
    });

    function makeLimb(parent, x, y, z, length, radius, material) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, length, 10),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        parent.add(mesh);

        return mesh;
    }

    // TORSO

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 1.05, 0.45),
        suitMat
    );

    torso.position.y = 1.35;
    torso.castShadow = true;
    player.add(torso);

    // HEAD

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        skinMat
    );

    head.position.y = 2.1;
    head.castShadow = true;
    player.add(head);

    // ARMS

    const leftArm = makeLimb(
        player, -0.58, 1.35, 0, 0.85, 0.13, suitMat
    );

    const rightArm = makeLimb(
        player, 0.58, 1.35, 0, 0.85, 0.13, suitMat
    );

    // LEGS

    const leftLeg = makeLimb(
        player, -0.23, 0.48, 0, 0.9, 0.16, darkMat
    );

    const rightLeg = makeLimb(
        player, 0.23, 0.48, 0, 0.9, 0.16, darkMat
    );

    player.position.set(0, 0, 17);

    // ==========================================
    // 11. ENERGY CREDITS
    // ==========================================

    const credits = [];

    const creditMat = new THREE.MeshStandardMaterial({
        color: 0xffd54a,
        emissive: 0xffa000,
        emissiveIntensity: 1.8,
        metalness: 0.7,
        roughness: 0.2
    });

    const creditPositions = [
        [-7, 1.8, 4],
        [-13, 2.8, 0],
        [-19, 3.8, -5],
        [-24, 4.8, -10],
        [8, 1.8, -2]
    ];

    for (const [x, y, z] of creditPositions) {

        const coin = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.1, 8, 20),
            creditMat
        );

        coin.position.set(x, y, z);

        coin.userData.baseY = y;
        coin.userData.phase = Math.random() * Math.PI * 2;

        scene.add(coin);
        credits.push(coin);
    }

    // ==========================================
    // 12. HUD
    // ==========================================

    const hud = document.createElement("div");

    hud.style.cssText = `
        position:absolute;
        top:18px;
        left:18px;
        color:white;
        font-family:Arial,sans-serif;
        pointer-events:none;
        text-shadow:0 2px 8px black;
        line-height:1.7;
        z-index:5;
    `;

    hud.innerHTML = `
        <div style="font-size:22px;font-weight:bold;">
            MY UNIVERSE
        </div>

        <div id="money">Credits: 0</div>

        <div id="quest">
            Quest: Collect 5 energy credits
        </div>

        <div style="margin-top:12px;color:#a9c8e8;font-size:13px;">
            W A S D — Move<br>
            ARROW KEYS — Rotate camera<br>
            SPACE — Jump<br>
            SHIFT — Sprint<br>
            MOUSE DRAG — Rotate camera<br>
            MOUSE WHEEL — Zoom
        </div>
    `;

    container.appendChild(hud);

    const moneyDisplay = hud.querySelector("#money");
    const questDisplay = hud.querySelector("#quest");

    let money = 0;
    let collected = 0;

    // ==========================================
    // 13. INPUT
    // ==========================================

    const keys = {};
    let jumpQueued = false;

    function keyDown(event) {

        keys[event.code] = true;

        if (event.code === "Space") {
            jumpQueued = true;
        }

        if (
            event.code === "Space" ||
            event.code.startsWith("Arrow")
        ) {
            event.preventDefault();
        }
    }

    function keyUp(event) {
        keys[event.code] = false;
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // ==========================================
    // 14. CAMERA ROTATION
    // ==========================================

    let yaw = 0;
    let pitch = 0.25;

    let cameraDistance = 8;
    let dragging = false;

    let previousMouseX = 0;
    let previousMouseY = 0;

    function mouseDown(event) {

        dragging = true;

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }

    function mouseUp() {
        dragging = false;
    }

    function mouseMove(event) {

        if (!dragging) return;

        const differenceX = event.clientX - previousMouseX;
        const differenceY = event.clientY - previousMouseY;

        yaw -= differenceX * 0.005;
        pitch -= differenceY * 0.005;

        pitch = THREE.MathUtils.clamp(pitch, -0.7, 1.0);

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }

    function wheel(event) {

        cameraDistance += event.deltaY * 0.005;

        cameraDistance = THREE.MathUtils.clamp(
            cameraDistance,
            4,
            14
        );
    }

    renderer.domElement.addEventListener("pointerdown", mouseDown);
    window.addEventListener("pointerup", mouseUp);
    window.addEventListener("pointermove", mouseMove);
    renderer.domElement.addEventListener("wheel", wheel);

    // ==========================================
    // 15. PLAYER PHYSICS
    // ==========================================

    const velocity = new THREE.Vector3();

    let velocityY = 0;
    let grounded = true;

    const playerRadius = 0.35;
    const playerHeight = 2.4;

    const clock = new THREE.Clock();

    // Check whether the player overlaps a solid box.

    function collidesAt(x, z, feetY) {

        const playerMinY = feetY;
        const playerMaxY = feetY + playerHeight;

        return solidBoxes.some(box => {

            const verticalOverlap =
                playerMinY < box.maxY &&
                playerMaxY > box.minY;

            const horizontalOverlap =
                Math.abs(x - box.x) < box.halfX + playerRadius &&
                Math.abs(z - box.z) < box.halfZ + playerRadius;

            return verticalOverlap && horizontalOverlap;
        });
    }

    // ==========================================
    // 16. ANIMATION
    // ==========================================

    let animationId;

    function animate() {

        animationId = requestAnimationFrame(animate);

        const dt = Math.min(clock.getDelta(), 0.04);
        const time = clock.elapsedTime;

        // --------------------------------------
        // ARROW KEY CAMERA CONTROLS
        // --------------------------------------

        const cameraSpeed = 1.8;

        if (keys.ArrowLeft) {
            yaw -= cameraSpeed * dt;
        }

        if (keys.ArrowRight) {
            yaw += cameraSpeed * dt;
        }

        if (keys.ArrowUp) {
            pitch += cameraSpeed * dt;
        }

        if (keys.ArrowDown) {
            pitch -= cameraSpeed * dt;
        }

        pitch = THREE.MathUtils.clamp(
            pitch,
            -0.7,
            1.0
        );

        // --------------------------------------
        // MOVEMENT INPUT
        // --------------------------------------

        let forward = 0;
        let sideways = 0;

        if (keys.KeyW) forward += 1;
        if (keys.KeyS) forward -= 1;
        if (keys.KeyD) sideways += 1;
        if (keys.KeyA) sideways -= 1;

        const inputLength = Math.hypot(forward, sideways);

        if (inputLength > 0) {
            forward /= inputLength;
            sideways /= inputLength;
        }

        const speed =
            keys.ShiftLeft || keys.ShiftRight ? 13 : 8;

        // Camera-relative movement

        const forwardX = -Math.sin(yaw);
        const forwardZ = -Math.cos(yaw);

        const rightX = Math.cos(yaw);
        const rightZ = -Math.sin(yaw);

        velocity.x =
            (forwardX * forward + rightX * sideways) * speed;

        velocity.z =
            (forwardZ * forward + rightZ * sideways) * speed;

        const moving = inputLength > 0;

        // --------------------------------------
        // HORIZONTAL COLLISION
        // --------------------------------------

        // Move along X first.
        // If blocked, the player can still slide along the wall.

        const nextX = player.position.x + velocity.x * dt;

        if (!collidesAt(
            nextX,
            player.position.z,
            player.position.y
        )) {
            player.position.x = nextX;
        }

        // Then move along Z.

        const nextZ = player.position.z + velocity.z * dt;

        if (!collidesAt(
            player.position.x,
            nextZ,
            player.position.y
        )) {
            player.position.z = nextZ;
        }

        // --------------------------------------
        // SHIP BOUNDARIES
        // --------------------------------------

        player.position.x = THREE.MathUtils.clamp(
            player.position.x,
            -33,
            33
        );

        player.position.z = THREE.MathUtils.clamp(
            player.position.z,
            -23,
            23
        );

        // --------------------------------------
        // JUMP
        // --------------------------------------

        if (jumpQueued && grounded) {
            velocityY = 10;
            grounded = false;
        }

        jumpQueued = false;

        // --------------------------------------
        // GRAVITY
        // --------------------------------------

        const previousY = player.position.y;

        velocityY -= 25 * dt;
        player.position.y += velocityY * dt;

        grounded = false;

        // --------------------------------------
        // FLOOR COLLISION
        // --------------------------------------

        if (player.position.y <= 0) {

            player.position.y = 0;
            velocityY = 0;
            grounded = true;
        }

        // --------------------------------------
        // PLATFORM LANDING
        // --------------------------------------

        if (velocityY <= 0) {

            for (const platform of platforms) {

                const withinX =
                    Math.abs(player.position.x - platform.x) <
                    platform.halfX - playerRadius;

                const withinZ =
                    Math.abs(player.position.z - platform.z) <
                    platform.halfZ - playerRadius;

                if (
                    withinX &&
                    withinZ &&
                    previousY >= platform.top - 0.08 &&
                    player.position.y <= platform.top
                ) {

                    player.position.y = platform.top;
                    velocityY = 0;
                    grounded = true;

                    break;
                }
            }
        }

        // --------------------------------------
        // WALKING ANIMATION
        // --------------------------------------

        const swing = moving && grounded
            ? Math.sin(time * 12) * 0.5
            : 0;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x = -swing;
        rightArm.rotation.x = swing;

        // --------------------------------------
        // FACE MOVEMENT DIRECTION
        // --------------------------------------

        if (moving) {
            player.rotation.y = Math.atan2(
                velocity.x,
                velocity.z
            );
        }

        // --------------------------------------
        // COLLECT CREDITS
        // --------------------------------------

        for (let i = credits.length - 1; i >= 0; i--) {

            const coin = credits[i];

            coin.rotation.y += dt * 2;

            coin.position.y =
                coin.userData.baseY +
                Math.sin(time * 3 + coin.userData.phase) * 0.3;

            if (player.position.distanceTo(coin.position) < 1.5) {

                scene.remove(coin);
                credits.splice(i, 1);

                money += 100;
                collected++;

                moneyDisplay.textContent = `Credits: ${money}`;

                questDisplay.textContent = collected >= 5
                    ? "Quest completed! +500 credits"
                    : `Quest: Collect 5 energy credits (${collected}/5)`;

                if (collected === 5) {

                    money += 500;

                    moneyDisplay.textContent = `Credits: ${money}`;
                }
            }
        }

        // --------------------------------------
        // THIRD-PERSON CAMERA
        // --------------------------------------

        const horizontalDistance =
            Math.cos(pitch) * cameraDistance;

        const cameraX =
            player.position.x +
            Math.sin(yaw) * horizontalDistance;

        const cameraY =
            player.position.y +
            1.3 +
            Math.sin(pitch) * cameraDistance;

        const cameraZ =
            player.position.z +
            Math.cos(yaw) * horizontalDistance;

        camera.position.lerp(
            new THREE.Vector3(cameraX, cameraY, cameraZ),
            1 - Math.pow(0.001, dt)
        );

        camera.lookAt(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        // --------------------------------------
        // RENDER
        // --------------------------------------

        renderer.render(scene, camera);
    }

    // ==========================================
    // 17. RESIZE
    // ==========================================

    const resizeObserver = new ResizeObserver(() => {

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    animate();

    // ==========================================
    // 18. CLEANUP WHEN LEAVING THE GAME
    // ==========================================

    return function stopSpaceGame() {

        cancelAnimationFrame(animationId);

        resizeObserver.disconnect();

        window.removeEventListener("keydown", keyDown);
        window.removeEventListener("keyup", keyUp);

        window.removeEventListener("pointerup", mouseUp);
        window.removeEventListener("pointermove", mouseMove);

        renderer.domElement.removeEventListener(
            "pointerdown",
            mouseDown
        );

        renderer.domElement.removeEventListener(
            "wheel",
            wheel
        );

        renderer.dispose();

        container.innerHTML = "";
    };
}
