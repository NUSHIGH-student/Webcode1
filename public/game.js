
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

    addSolidBox(0, 5, -25, 70, 10, 1, wallMat);
    addSolidBox(0, 5, 25, 70, 10, 1, wallMat);
    addSolidBox(-35, 5, 0, 1, 10, 50, wallMat);
    addSolidBox(35, 5, 0, 1, 10, 50, wallMat);

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

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 1.05, 0.45),
        suitMat
    );

    torso.position.y = 1.35;
    torso.castShadow = true;
    player.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        skinMat
    );

    head.position.y = 2.1;
    head.castShadow = true;
    player.add(head);

    const leftArm = makeLimb(
        player, -0.58, 1.35, 0, 0.85, 0.13, suitMat
    );

    const rightArm = makeLimb(
        player, 0.58, 1.35, 0, 0.85, 0.13, suitMat
    );

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
    // 12. MONEY AND PLAYER HEALTH
    // ==========================================

    let money = 0;
    let collected = 0;

    let playerHealth = 100;
    let playerDamageCooldown = 0;

    // ==========================================
    // 13. HUD
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
        <div id="health">Health: 100 / 100</div>
        <div id="weapon">Weapon: Starter Blaster</div>
        <div id="quest">Quest: Collect 5 energy credits</div>

        <div style="margin-top:12px;color:#a9c8e8;font-size:13px;">
            W A S D — Move<br>
            SPACE — Jump<br>
            SHIFT — Sprint<br>
            MOUSE — Aim<br>
            LEFT CLICK — Shoot<br>
            1 / 2 / 3 / 4 — Switch weapon<br>
            Z — Punch<br>
            X — Energy burst<br>
            C — Dash<br>
            ARROWS — Rotate camera<br>
            RIGHT MOUSE DRAG — Rotate camera<br>
            MOUSE WHEEL — Zoom
        </div>
    `;

    container.appendChild(hud);

    const moneyDisplay = hud.querySelector("#money");
    const healthDisplay = hud.querySelector("#health");
    const weaponDisplay = hud.querySelector("#weapon");
    const questDisplay = hud.querySelector("#quest");

    function updateMoney() {
        moneyDisplay.textContent = `Credits: ${money}`;
    }

    function updateHealth() {
        healthDisplay.textContent =
            `Health: ${Math.max(0, playerHealth)} / 100`;
    }

    function addMoney(amount) {
        money += amount;
        updateMoney();
    }

    // ==========================================
    // 14. NOTIFICATIONS
    // ==========================================

    const notification = document.createElement("div");

    notification.style.cssText = `
        position:absolute;
        top:22px;
        right:25px;
        color:#ffffff;
        font-family:Arial,sans-serif;
        font-size:17px;
        font-weight:bold;
        text-shadow:0 2px 8px black;
        pointer-events:none;
        z-index:10;
    `;

    container.appendChild(notification);

    let notificationTimer = 0;

    function notify(message) {
        notification.textContent = message;
        notificationTimer = 2;
    }

    // ==========================================
    // 15. INPUT
    // ==========================================

    const keys = {};

    let jumpQueued = false;
    let punchQueued = false;
    let burstQueued = false;
    let dashQueued = false;

    function keyDown(event) {

        keys[event.code] = true;

        if (event.code === "Space") {
            jumpQueued = true;
        }

        if (event.code === "KeyZ") {
            punchQueued = true;
        }

        if (event.code === "KeyX") {
            burstQueued = true;
        }

        if (event.code === "KeyC") {
            dashQueued = true;
        }

        // Weapon switching

        if (event.code === "Digit1") selectWeapon(0);
        if (event.code === "Digit2") selectWeapon(1);
        if (event.code === "Digit3") selectWeapon(2);
        if (event.code === "Digit4") selectWeapon(3);

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
    // 16. CAMERA ROTATION
    // ==========================================

    let yaw = 0;
    let pitch = 0.25;

    let cameraDistance = 8;
    let dragging = false;

    let previousMouseX = 0;
    let previousMouseY = 0;

    const mouse = new THREE.Vector2(0, 0);

    const raycaster = new THREE.Raycaster();

    const aimPlane = new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -1.3
    );

    const aimPoint = new THREE.Vector3();

    function updateMousePosition(event) {

        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        mouse.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function mouseDown(event) {

        updateMousePosition(event);

        // Right mouse button rotates the camera.
        if (event.button === 2) {

            dragging = true;

            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        }

        // Left mouse button shoots.
        if (event.button === 0) {
            shootQueued = true;
        }
    }

    function mouseUp() {
        dragging = false;
    }

    function mouseMove(event) {

        updateMousePosition(event);

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

    renderer.domElement.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    renderer.domElement.addEventListener("wheel", wheel);

    let shootQueued = false;

    // ==========================================
    // 17. PLAYER PHYSICS
    // ==========================================

    const velocity = new THREE.Vector3();

    let velocityY = 0;
    let grounded = true;

    const playerRadius = 0.35;
    const playerHeight = 2.4;

    const clock = new THREE.Clock();

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
    // 18. MOUSE AIMING
    // ==========================================

    function getAimPoint() {

        raycaster.setFromCamera(mouse, camera);

        aimPlane.constant = -(player.position.y + 1.3);

        const result = raycaster.ray.intersectPlane(
            aimPlane,
            aimPoint
        );

        if (!result) {

            const direction = raycaster.ray.direction.clone();

            return camera.position.clone().add(
                direction.multiplyScalar(30)
            );
        }

        return aimPoint.clone();
    }

    function getAimDirection() {

        const origin = new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        const target = getAimPoint();

        const direction = target.sub(origin);

        if (direction.lengthSq() < 0.001) {
            direction.set(0, 0, -1);
        }

        return direction.normalize();
    }

    // ==========================================
    // 19. WEAPON SYSTEM
    // ==========================================

    const weapons = [
        {
            name: "Starter Blaster",
            damage: 25,
            speed: 24,
            cooldown: 0.35,
            color: 0x36caff,
            size: 0.16,
            pellets: 1
        },
        {
            name: "Rapid Blaster",
            damage: 12,
            speed: 30,
            cooldown: 0.12,
            color: 0xff4c4c,
            size: 0.12,
            pellets: 1
        },
        {
            name: "Heavy Plasma",
            damage: 45,
            speed: 15,
            cooldown: 0.8,
            color: 0xb45cff,
            size: 0.25,
            pellets: 1
        },
        {
            name: "Scatter Blaster",
            damage: 9,
            speed: 20,
            cooldown: 0.65,
            color: 0xffd34a,
            size: 0.11,
            pellets: 5
        }
    ];

    let selectedWeapon = 0;
    let weaponCooldown = 0;

    function selectWeapon(index) {

        if (index < 0 || index >= weapons.length) return;

        selectedWeapon = index;

        weaponDisplay.textContent =
            `Weapon: ${weapons[index].name}`;

        notify(`Equipped ${weapons[index].name}`);
    }

    const projectiles = [];

    function createProjectile(origin, direction, weapon, damage) {

        const material = new THREE.MeshStandardMaterial({
            color: weapon.color,
            emissive: weapon.color,
            emissiveIntensity: 3,
            metalness: 0.3,
            roughness: 0.2
        });

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(weapon.size, 12, 12),
            material
        );

        mesh.position.copy(origin);
        scene.add(mesh);

        projectiles.push({
            mesh,
            direction: direction.clone().normalize(),
            speed: weapon.speed,
            damage,
            life: 2.5,
            distance: 0,
            maxDistance: 55,
            color: weapon.color
        });
    }

    function fireWeapon() {

        if (weaponCooldown > 0) return;

        const weapon = weapons[selectedWeapon];

        const origin = new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        const direction = getAimDirection();

        for (let i = 0; i < weapon.pellets; i++) {

            const shotDirection = direction.clone();

            if (weapon.pellets > 1) {

                shotDirection.x += (Math.random() - 0.5) * 0.2;
                shotDirection.y += (Math.random() - 0.5) * 0.12;
                shotDirection.z += (Math.random() - 0.5) * 0.2;

                shotDirection.normalize();
            }

            createProjectile(
                origin,
                shotDirection,
                weapon,
                weapon.damage
            );
        }

        weaponCooldown = weapon.cooldown;
    }

    // ==========================================
    // 20. ENEMY NPCs
    // ==========================================

    const enemies = [];

    const enemyBodyMat = new THREE.MeshStandardMaterial({
        color: 0x9b263d,
        metalness: 0.5,
        roughness: 0.4
    });

    const enemyHeadMat = new THREE.MeshStandardMaterial({
        color: 0xff5656,
        emissive: 0x8b1010,
        emissiveIntensity: 0.7
    });

    function createEnemy(x, z) {

        const enemy = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.1, 0.55),
            enemyBodyMat
        );

        body.position.y = 1.25;
        body.castShadow = true;
        enemy.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 12, 12),
            enemyHeadMat
        );

        head.position.y = 2.05;
        enemy.add(head);

        const eye = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.08, 0.08),
            new THREE.MeshBasicMaterial({
                color: 0xff0000
            })
        );

        eye.position.set(0, 2.08, 0.28);
        enemy.add(eye);

        enemy.position.set(x, 0, z);
        scene.add(enemy);

        const healthBar = new THREE.Group();

        const background = new THREE.Mesh(
            new THREE.PlaneGeometry(1.1, 0.12),
            new THREE.MeshBasicMaterial({
                color: 0x330000,
                side: THREE.DoubleSide
            })
        );

        const fill = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 0.09),
            new THREE.MeshBasicMaterial({
                color: 0xff3333,
                side: THREE.DoubleSide
            })
        );

        fill.position.z = 0.01;

        healthBar.add(background);
        healthBar.add(fill);

        scene.add(healthBar);

        const data = {
            group: enemy,
            health: 100,
            maxHealth: 100,
            attackCooldown: 0,
            healthBar,
            healthFill: fill,
            alive: true,
            respawnTimer: 0,
            spawnX: x,
            spawnZ: z
        };

        enemies.push(data);

        return data;
    }

    createEnemy(-25, 15);
    createEnemy(20, 5);
    createEnemy(25, -15);
    createEnemy(-5, -15);

    function damageEnemy(enemy, amount) {

        if (!enemy.alive) return;

        enemy.health -= amount;

        if (enemy.health <= 0) {

            enemy.health = 0;
            enemy.alive = false;

            scene.remove(enemy.group);
            scene.remove(enemy.healthBar);

            addMoney(150);

            notify("Enemy defeated! +150 Credits");

            enemy.respawnTimer = 8;
        }
    }

    // ==========================================
    // 21. PROJECTILE COLLISION
    // ==========================================

    function pointSegmentDistance(point, start, end) {

        const segment = end.clone().sub(start);

        const lengthSq = segment.lengthSq();

        if (lengthSq === 0) {
            return point.distanceTo(start);
        }

        const t = THREE.MathUtils.clamp(
            point.clone().sub(start).dot(segment) / lengthSq,
            0,
            1
        );

        const closest = start.clone().add(
            segment.multiplyScalar(t)
        );

        return point.distanceTo(closest);
    }

    function projectileHitsWall(start, end) {

        const direction = end.clone().sub(start);

        const length = direction.length();

        if (length === 0) return false;

        direction.normalize();

        const ray = new THREE.Ray(start, direction);

        for (const box of solidBoxes) {

            const bounds = new THREE.Box3(
                new THREE.Vector3(
                    box.x - box.halfX,
                    box.minY,
                    box.z - box.halfZ
                ),
                new THREE.Vector3(
                    box.x + box.halfX,
                    box.maxY,
                    box.z + box.halfZ
                )
            );

            const hit = ray.intersectBox(bounds, new THREE.Vector3());

            if (hit && start.distanceTo(hit) <= length) {
                return true;
            }
        }

        // Outer map boundaries

        if (
            end.x < -34 ||
            end.x > 34 ||
            end.z < -24 ||
            end.z > 24
        ) {
            return true;
        }

        return false;
    }

    function updateProjectiles(dt) {

        for (let i = projectiles.length - 1; i >= 0; i--) {

            const projectile = projectiles[i];

            const start = projectile.mesh.position.clone();

            const movement = projectile.direction.clone().multiplyScalar(
                projectile.speed * dt
            );

            const end = start.clone().add(movement);

            projectile.life -= dt;
            projectile.distance += movement.length();

            let remove = false;

            // Wall collision

            if (projectileHitsWall(start, end)) {
                remove = true;
            }

            // Enemy collision

            if (!remove) {

                for (const enemy of enemies) {

                    if (!enemy.alive) continue;

                    const target = new THREE.Vector3(
                        enemy.group.position.x,
                        enemy.group.position.y + 1.3,
                        enemy.group.position.z
                    );

                    const distance = pointSegmentDistance(
                        target,
                        start,
                        end
                    );

                    if (distance < 0.75) {

                        damageEnemy(enemy, projectile.damage);

                        remove = true;
                        break;
                    }
                }
            }

            if (
                projectile.life <= 0 ||
                projectile.distance >= projectile.maxDistance
            ) {
                remove = true;
            }

            if (remove) {

                scene.remove(projectile.mesh);
                projectile.mesh.geometry.dispose();
                projectile.mesh.material.dispose();

                projectiles.splice(i, 1);

            } else {

                projectile.mesh.position.copy(end);
            }
        }
    }

    // ==========================================
    // 22. MELEE PUNCH — Z
    // ==========================================

    let punchCooldown = 0;
    let punchAnimation = 0;

    function punch() {

        if (punchCooldown > 0) return;

        const direction = getAimDirection();

        const origin = new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        let hitSomething = false;

        for (const enemy of enemies) {

            if (!enemy.alive) continue;

            const target = new THREE.Vector3(
                enemy.group.position.x,
                enemy.group.position.y + 1.3,
                enemy.group.position.z
            );

            const difference = target.clone().sub(origin);

            const distance = difference.length();

            if (distance > 2.2) continue;

            difference.normalize();

            if (direction.dot(difference) > 0.45) {

                damageEnemy(enemy, 25);

                hitSomething = true;
            }
        }

        punchCooldown = 0.55;
        punchAnimation = 0.25;

        if (hitSomething) {
            notify("Punch hit!");
        }
    }

    // ==========================================
    // 23. ENERGY BURST — X
    // ==========================================

    let burstCooldown = 0;

    function energyBurst() {

        if (burstCooldown > 0) return;

        const origin = new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        const direction = getAimDirection();

        const specialWeapon = {
            speed: 18,
            size: 0.32,
            color: 0xff7b27
        };

        createProjectile(
            origin,
            direction,
            specialWeapon,
            40
        );

        burstCooldown = 2;

        notify("Energy burst!");
    }

    // ==========================================
    // 24. DASH — C
    // ==========================================

    let dashCooldown = 0;

    function dash() {

        if (dashCooldown > 0) return;

        const direction = getAimDirection();

        // Dash horizontally towards the mouse aim.

        direction.y = 0;

        if (direction.lengthSq() < 0.001) return;

        direction.normalize();

        const distance = 4;
        const steps = 12;

        for (let i = 1; i <= steps; i++) {

            const amount = distance / steps;

            const nextX =
                player.position.x + direction.x * amount;

            const nextZ =
                player.position.z + direction.z * amount;

            const boundedX = THREE.MathUtils.clamp(nextX, -33, 33);
            const boundedZ = THREE.MathUtils.clamp(nextZ, -23, 23);

            if (
                collidesAt(
                    boundedX,
                    boundedZ,
                    player.position.y
                )
            ) {
                break;
            }

            player.position.x = boundedX;
            player.position.z = boundedZ;
        }

        dashCooldown = 3;

        notify("Dash!");
    }

    // ==========================================
    // 25. ENEMY AI
    // ==========================================

    function updateEnemies(dt) {

        for (const enemy of enemies) {

            if (!enemy.alive) {

                enemy.respawnTimer -= dt;

                if (enemy.respawnTimer <= 0) {

                    enemy.health = enemy.maxHealth;
                    enemy.alive = true;

                    enemy.group.position.set(
                        enemy.spawnX,
                        0,
                        enemy.spawnZ
                    );

                    scene.add(enemy.group);
                    scene.add(enemy.healthBar);
                }

                continue;
            }

            const difference = new THREE.Vector3(
                player.position.x - enemy.group.position.x,
                0,
                player.position.z - enemy.group.position.z
            );

            const distance = difference.length();

            enemy.attackCooldown -= dt;

            // Follow player

            if (distance > 1.5 && distance < 25) {

                difference.normalize();

                const speed = 2.5;

                const nextX =
                    enemy.group.position.x + difference.x * speed * dt;

                const nextZ =
                    enemy.group.position.z + difference.z * speed * dt;

                // Avoid walking through walls.

                if (!collidesAt(nextX, enemy.group.position.z, 0)) {
                    enemy.group.position.x = nextX;
                }

                if (!collidesAt(enemy.group.position.x, nextZ, 0)) {
                    enemy.group.position.z = nextZ;
                }

                enemy.group.rotation.y = Math.atan2(
                    difference.x,
                    difference.z
                );
            }

            // Attack player

            if (
                distance < 1.7 &&
                enemy.attackCooldown <= 0
            ) {

                if (playerDamageCooldown <= 0) {

                    playerHealth -= 10;

                    playerDamageCooldown = 0.8;

                    updateHealth();

                    notify("You were hit!");
                }

                enemy.attackCooldown = 1.2;
            }

            // Enemy health bar

            enemy.healthBar.position.set(
                enemy.group.position.x,
                enemy.group.position.y + 2.7,
                enemy.group.position.z
            );

            enemy.healthBar.lookAt(camera.position);

            enemy.healthFill.scale.x = Math.max(
                0,
                enemy.health / enemy.maxHealth
            );

            enemy.healthFill.position.x =
                -(1 - enemy.health / enemy.maxHealth) * 0.5;
        }
    }

    // ==========================================
    // 26. PLAYER DEATH AND RESPAWN
    // ==========================================

    function checkPlayerHealth() {

        if (playerHealth > 0) return;

        playerHealth = 100;

        player.position.set(0, 0, 17);

        velocityY = 0;
        grounded = true;

        updateHealth();

        notify("Respawned!");
    }

    // ==========================================
    // 27. ANIMATION
    // ==========================================

    let animationId;

    function animate() {

        animationId = requestAnimationFrame(animate);

        const dt = Math.min(clock.getDelta(), 0.04);
        const time = clock.elapsedTime;

        // --------------------------------------
        // COOLDOWNS
        // --------------------------------------

        weaponCooldown = Math.max(0, weaponCooldown - dt);
        punchCooldown = Math.max(0, punchCooldown - dt);
        burstCooldown = Math.max(0, burstCooldown - dt);
        dashCooldown = Math.max(0, dashCooldown - dt);
        playerDamageCooldown = Math.max(
            0,
            playerDamageCooldown - dt
        );

        notificationTimer -= dt;

        if (notificationTimer <= 0) {
            notification.textContent = "";
        }

        // --------------------------------------
        // ARROW KEY CAMERA CONTROLS
        // --------------------------------------

        const cameraSpeed = 1.8;

        // Left/right now rotate vertically.

        if (keys.ArrowLeft) {
            pitch += cameraSpeed * dt;
        }

        if (keys.ArrowRight) {
            pitch -= cameraSpeed * dt;
        }

        // Up/down now rotate horizontally.

        if (keys.ArrowUp) {
            yaw -= cameraSpeed * dt;
        }

        if (keys.ArrowDown) {
            yaw += cameraSpeed * dt;
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

        const nextX = player.position.x + velocity.x * dt;

        if (!collidesAt(
            nextX,
            player.position.z,
            player.position.y
        )) {
            player.position.x = nextX;
        }

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
        // FACE MOUSE AIM
        // --------------------------------------

        const aimDirection = getAimDirection();

        player.rotation.y = Math.atan2(
            aimDirection.x,
            aimDirection.z
        );

        // --------------------------------------
        // PUNCH ANIMATION
        // --------------------------------------

        if (punchAnimation > 0) {

            punchAnimation -= dt;

            rightArm.rotation.x = -2;
        }

        // --------------------------------------
        // PLAYER ACTIONS
        // --------------------------------------

        if (shootQueued) {
            fireWeapon();
            shootQueued = false;
        }

        if (punchQueued) {
            punch();
            punchQueued = false;
        }

        if (burstQueued) {
            energyBurst();
            burstQueued = false;
        }

        if (dashQueued) {
            dash();
            dashQueued = false;
        }

        // --------------------------------------
        // PROJECTILES
        // --------------------------------------

        updateProjectiles(dt);

        // --------------------------------------
        // ENEMY AI
        // --------------------------------------

        updateEnemies(dt);

        // --------------------------------------
        // PLAYER HEALTH
        // --------------------------------------

        checkPlayerHealth();

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

                addMoney(100);

                collected++;

                questDisplay.textContent = collected >= 5
                    ? "Quest completed! +500 credits"
                    : `Quest: Collect 5 energy credits (${collected}/5)`;

                if (collected === 5) {
                    addMoney(500);
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
    // 28. RESIZE
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
    // 29. CLEANUP
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
