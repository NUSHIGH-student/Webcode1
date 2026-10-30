
import * as THREE from "three";

export function startSpaceGame(container) {

    container.innerHTML = "";
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "hidden";
    container.style.background = "#050914";

    // ==========================================
    // 1. SCENE
    // ==========================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050914);
    scene.fog = new THREE.Fog(0x050914, 65, 155);

    const camera = new THREE.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.1,
        250
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x9bbcff, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(10, 25, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x168cff, 130, 50);
    blueLight.position.set(-20, 8, -15);
    scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x913cff, 130, 50);
    purpleLight.position.set(20, 8, 15);
    scene.add(purpleLight);

    // ==========================================
    // 2. MATERIALS
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
    // 3. MAP AND COLLISION
    // ==========================================

    const solidBoxes = [];
    const platforms = [];

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

    // Expanded floor: 110 x 80

    addBox(0, -0.5, 0, 110, 1, 80, floorMat);

    // Outer walls

    addSolidBox(0, 5, -40, 110, 10, 1, wallMat);
    addSolidBox(0, 5, 40, 110, 10, 1, wallMat);
    addSolidBox(-55, 5, 0, 1, 10, 80, wallMat);
    addSolidBox(55, 5, 0, 1, 10, 80, wallMat);

    // Interior walls

    addSolidBox(-18, 4, -12, 1, 8, 24, wallMat);
    addSolidBox(18, 4, 12, 1, 8, 24, wallMat);

    addSolidBox(-37, 4, 12, 1, 8, 25, wallMat);
    addSolidBox(37, 4, -12, 1, 8, 25, wallMat);

    // Reactor structures

    for (let i = -3; i <= 3; i++) {

        addSolidBox(
            i * 6,
            4,
            -31,
            2,
            8,
            2,
            wallMat
        );

        addBox(
            i * 6,
            7,
            -29.8,
            0.3,
            0.3,
            0.3,
            glowMat
        );
    }

    // Parkour platforms

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

    addPlatform(-9, 1.2, 5, 5, 5);
    addPlatform(-15, 2.2, 0, 4, 4);
    addPlatform(-21, 3.2, -5, 4, 4);
    addPlatform(-27, 4.2, -10, 5, 5);

    addPlatform(9, 1.2, -5, 5, 5);
    addPlatform(15, 2.2, -10, 4, 4);
    addPlatform(21, 3.2, -15, 4, 4);

    addPlatform(35, 1.5, 22, 5, 5);
    addPlatform(42, 3, 17, 5, 5);
    addPlatform(48, 4.5, 10, 5, 5);

    // ==========================================
    // 4. PLAYER
    // ==========================================

    const player = new THREE.Group();
    scene.add(player);

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xe4ad85
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
    player.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        skinMat
    );

    head.position.y = 2.1;
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

    player.position.set(0, 0, 30);

    // ==========================================
    // 5. PLAYER STATS
    // ==========================================

    let money = 500;
    let playerHealth = 100;
    const maxHealth = 100;

    let playerDamageCooldown = 0;

    // ==========================================
    // 6. HUD
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

        <div id="money">Credits: 500</div>

        <div id="health">Health: 100 / 100</div>

        <div style="background:#333;width:180px;height:12px;border-radius:6px;overflow:hidden;">
            <div id="healthBar" style="background:#31df75;width:100%;height:100%;"></div>
        </div>

        <div id="weapon">Weapon: Starter Blaster</div>

        <div id="quest">Explore the spaceship!</div>

        <div style="margin-top:12px;color:#a9c8e8;font-size:13px;">
            W / ↑ — Move forwards<br>
            S / ↓ — Move backwards<br>
            A / D — Strafe<br>
            ← / → — Rotate camera<br>
            MOUSE DRAG — Rotate camera<br>
            SPACE — Jump<br>
            SHIFT — Sprint<br>
            LEFT CLICK — Shoot<br>
            1 / 2 / 3 / 4 — Switch weapons<br>
            Z — Energy beam<br>
            X — Swinging projectile<br>
            C — Super dash<br>
            E — Open shop
        </div>
    `;

    container.appendChild(hud);

    const moneyDisplay = hud.querySelector("#money");
    const healthDisplay = hud.querySelector("#health");
    const healthBar = hud.querySelector("#healthBar");
    const weaponDisplay = hud.querySelector("#weapon");
    const questDisplay = hud.querySelector("#quest");

    function updateMoney() {
        moneyDisplay.textContent = `Credits: ${money}`;
    }

    function updateHealth() {

        healthDisplay.textContent =
            `Health: ${Math.max(0, playerHealth)} / ${maxHealth}`;

        healthBar.style.width =
            `${Math.max(0, playerHealth) / maxHealth * 100}%`;

        healthBar.style.background =
            playerHealth > 50 ? "#31df75" :
            playerHealth > 25 ? "#ffbd35" :
            "#ff3939";
    }

    // ==========================================
    // 7. NOTIFICATIONS
    // ==========================================

    const notification = document.createElement("div");

    notification.style.cssText = `
        position:absolute;
        top:22px;
        right:25px;
        color:white;
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
    // 8. SHOP
    // ==========================================

    const shop = document.createElement("div");

    shop.style.cssText = `
        display:none;
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        width:340px;
        padding:22px;
        background:rgba(8,18,38,0.97);
        border:2px solid #36caff;
        border-radius:12px;
        color:white;
        font-family:Arial,sans-serif;
        z-index:20;
        box-shadow:0 0 30px #0875ff55;
    `;

    shop.innerHTML = `
        <h2 style="margin-top:0;color:#36caff;">WEAPON SHOP</h2>

        <div id="shopBalance" style="margin-bottom:15px;">
            Credits: 500
        </div>

        <div id="shopItems"></div>

        <button id="closeShop" style="
            width:100%;
            padding:10px;
            margin-top:15px;
            background:#263e67;
            color:white;
            border:0;
            border-radius:6px;
            cursor:pointer;
        ">CLOSE</button>
    `;

    container.appendChild(shop);

    const shopBalance = shop.querySelector("#shopBalance");
    const shopItems = shop.querySelector("#shopItems");

    let shopOpen = false;

    const weaponData = [
        {
            name: "Starter Blaster",
            price: 0,
            damage: 20,
            speed: 25,
            cooldown: 0.35,
            color: 0x36caff,
            size: 0.15,
            type: "normal",
            pellets: 1
        },
        {
            name: "Rapid Blaster",
            price: 600,
            damage: 12,
            speed: 32,
            cooldown: 0.12,
            color: 0xff4545,
            size: 0.12,
            type: "normal",
            pellets: 1
        },
        {
            name: "Heavy Plasma",
            price: 1200,
            damage: 50,
            speed: 17,
            cooldown: 0.8,
            color: 0xb45cff,
            size: 0.26,
            type: "normal",
            pellets: 1
        },
        {
            name: "Scatter Blaster",
            price: 1800,
            damage: 10,
            speed: 23,
            cooldown: 0.7,
            color: 0xffd34a,
            size: 0.12,
            type: "normal",
            pellets: 5
        }
    ];

    const ownedWeapons = [true, false, false, false];

    let selectedWeapon = 0;

    function refreshShop() {

        shopBalance.textContent = `Credits: ${money}`;

        shopItems.innerHTML = "";

        weaponData.forEach((weapon, index) => {

            const row = document.createElement("div");

            row.style.cssText = `
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:8px;
                padding:9px 0;
                border-bottom:1px solid #30445e;
            `;

            const details = document.createElement("div");

            details.innerHTML = `
                <strong>${weapon.name}</strong>
                <div style="font-size:12px;color:#a9c8e8;">
                    Damage: ${weapon.damage}
                </div>
                <div style="font-size:12px;color:#ffd34a;">
                    ${weapon.price === 0 ? "Free" : weapon.price + " Credits"}
                </div>
            `;

            const button = document.createElement("button");

            button.style.cssText = `
                padding:8px;
                border:0;
                border-radius:5px;
                cursor:pointer;
                color:white;
                background:#176a9b;
            `;

            if (ownedWeapons[index]) {

                button.textContent =
                    selectedWeapon === index ? "EQUIPPED" : "EQUIP";

                button.onclick = () => {

                    selectWeapon(index);
                    refreshShop();
                };

            } else {

                button.textContent = "BUY";

                button.onclick = () => {

                    if (money < weapon.price) {

                        notify("Not enough Credits!");
                        return;
                    }

                    money -= weapon.price;
                    ownedWeapons[index] = true;

                    updateMoney();
                    selectWeapon(index);

                    notify(`Purchased ${weapon.name}!`);

                    refreshShop();
                };
            }

            row.appendChild(details);
            row.appendChild(button);

            shopItems.appendChild(row);
        });
    }

    function openShop() {

        shopOpen = true;
        shop.style.display = "block";

        refreshShop();
    }

    function closeShop() {

        shopOpen = false;
        shop.style.display = "none";
    }

    shop.querySelector("#closeShop").onclick = closeShop;

    // ==========================================
    // 9. INPUT
    // ==========================================

    const keys = {};

    let jumpQueued = false;
    let shootQueued = false;
    let beamQueued = false;
    let swingQueued = false;
    let dashQueued = false;

    function selectWeapon(index) {

        if (!ownedWeapons[index]) {

            notify("You do not own this weapon!");
            return;
        }

        selectedWeapon = index;

        weaponDisplay.textContent =
            `Weapon: ${weaponData[index].name}`;

        notify(`Equipped ${weaponData[index].name}`);
    }

    function keyDown(event) {

        keys[event.code] = true;

        if (event.code === "Space") jumpQueued = true;
        if (event.code === "KeyZ") beamQueued = true;
        if (event.code === "KeyX") swingQueued = true;
        if (event.code === "KeyC") dashQueued = true;

        if (event.code === "Digit1") selectWeapon(0);
        if (event.code === "Digit2") selectWeapon(1);
        if (event.code === "Digit3") selectWeapon(2);
        if (event.code === "Digit4") selectWeapon(3);

        if (event.code === "KeyE" && !shopOpen) {
            if (player.position.distanceTo(new THREE.Vector3(0, 0, 22)) < 7) {
                openShop();
            }
        }

        if (event.code === "Escape") closeShop();

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
    // 10. CAMERA AND MOUSE
    // ==========================================

    let yaw = 0;
    let pitch = 0.25;

    let cameraDistance = 9;
    let dragging = false;

    let previousMouseX = 0;
    let previousMouseY = 0;

    const mouse = new THREE.Vector2();

    const raycaster = new THREE.Raycaster();

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

        if (event.button === 2) {

            dragging = true;

            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        }

        if (event.button === 0 && !shopOpen) {
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
            16
        );
    }

    renderer.domElement.addEventListener("pointerdown", mouseDown);
    window.addEventListener("pointerup", mouseUp);
    window.addEventListener("pointermove", mouseMove);

    renderer.domElement.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    renderer.domElement.addEventListener("wheel", wheel);

    // ==========================================
    // 11. PHYSICS
    // ==========================================

    let velocityY = 0;
    let grounded = true;

    const playerRadius = 0.35;
    const playerHeight = 2.4;

    const clock = new THREE.Clock();

    function collidesAt(x, z, feetY) {

        return solidBoxes.some(box => {

            const verticalOverlap =
                feetY < box.maxY &&
                feetY + playerHeight > box.minY;

            const horizontalOverlap =
                Math.abs(x - box.x) < box.halfX + playerRadius &&
                Math.abs(z - box.z) < box.halfZ + playerRadius;

            return verticalOverlap && horizontalOverlap;
        });
    }

    // ==========================================
    // 12. MOUSE AIMING
    // ==========================================

    function getAimDirection() {

        raycaster.setFromCamera(mouse, camera);

        const origin = new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );

        const plane = new THREE.Plane(
            new THREE.Vector3(0, 1, 0),
            -(player.position.y + 1.3)
        );

        const target = new THREE.Vector3();

        raycaster.ray.intersectPlane(plane, target);

        if (!Number.isFinite(target.x)) {
            return camera.getWorldDirection(new THREE.Vector3());
        }

        const direction = target.sub(origin);

        if (direction.lengthSq() < 0.001) {
            return camera.getWorldDirection(new THREE.Vector3());
        }

        return direction.normalize();
    }

    // ==========================================
    // 13. PROJECTILES
    // ==========================================

    const projectiles = [];

    function createProjectile(origin, direction, options) {

        const material = new THREE.MeshStandardMaterial({
            color: options.color,
            emissive: options.color,
            emissiveIntensity: 3
        });

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(options.size, 12, 12),
            material
        );

        mesh.position.copy(origin);
        scene.add(mesh);

        projectiles.push({
            mesh,
            direction: direction.clone().normalize(),
            speed: options.speed,
            damage: options.damage,
            life: options.life || 2.5,
            distance: 0,
            maxDistance: options.maxDistance || 60,
            color: options.color,
            swing: options.swing || false,
            swingTime: 0
        });
    }

    function getPlayerOrigin() {

        return new THREE.Vector3(
            player.position.x,
            player.position.y + 1.3,
            player.position.z
        );
    }

    function shoot() {

        if (weaponCooldown > 0) return;

        const weapon = weaponData[selectedWeapon];

        const origin = getPlayerOrigin();
        const direction = getAimDirection();

        for (let i = 0; i < weapon.pellets; i++) {

            const shotDirection = direction.clone();

            if (weapon.pellets > 1) {

                shotDirection.x += (Math.random() - 0.5) * 0.2;
                shotDirection.y += (Math.random() - 0.5) * 0.15;
                shotDirection.z += (Math.random() - 0.5) * 0.2;

                shotDirection.normalize();
            }

            createProjectile(origin, shotDirection, {
                speed: weapon.speed,
                damage: weapon.damage,
                color: weapon.color,
                size: weapon.size
            });
        }

        weaponCooldown = weapon.cooldown;
    }

    let weaponCooldown = 0;

    // ==========================================
    // 14. ENEMIES
    // ==========================================

    const enemies = [];

    function createEnemy(x, z) {

        const group = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.9, 1.1, 0.55),
            new THREE.MeshStandardMaterial({
                color: 0x9b263d,
                metalness: 0.5
            })
        );

        body.position.y = 1.25;
        group.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 12, 12),
            new THREE.MeshStandardMaterial({
                color: 0xff5656,
                emissive: 0x8b1010
            })
        );

        head.position.y = 2.05;
        group.add(head);

        group.position.set(x, 0, z);
        scene.add(group);

        const bar = new THREE.Group();

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

        bar.add(background);
        bar.add(fill);

        scene.add(bar);

        enemies.push({
            group,
            bar,
            fill,
            health: 100,
            alive: true,
            cooldown: 0,
            respawn: 0,
            spawnX: x,
            spawnZ: z
        });
    }

    createEnemy(-45, 25);
    createEnemy(45, 25);
    createEnemy(-45, -25);
    createEnemy(45, -25);
    createEnemy(0, -35);

    function damageEnemy(enemy, damage) {

        if (!enemy.alive) return;

        enemy.health -= damage;

        if (enemy.health <= 0) {

            enemy.health = 0;
            enemy.alive = false;

            scene.remove(enemy.group);
            scene.remove(enemy.bar);

            money += 150;
            updateMoney();

            notify("Enemy defeated! +150 Credits");

            enemy.respawn = 8;
        }
    }

    // ==========================================
    // 15. PROJECTILE WALL COLLISION
    // ==========================================

    function projectileHitsWall(start, end) {

        const direction = end.clone().sub(start);
        const length = direction.length();

        if (length < 0.0001) return false;

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

            const hit = ray.intersectBox(
                bounds,
                new THREE.Vector3()
            );

            if (hit && start.distanceTo(hit) <= length) {
                return true;
            }
        }

        return (
            end.x < -54 ||
            end.x > 54 ||
            end.z < -39 ||
            end.z > 39
        );
    }

    function segmentDistance(point, start, end) {

        const segment = end.clone().sub(start);
        const lengthSq = segment.lengthSq();

        if (lengthSq === 0) return point.distanceTo(start);

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

    function updateProjectiles(dt) {

        for (let i = projectiles.length - 1; i >= 0; i--) {

            const p = projectiles[i];

            const start = p.mesh.position.clone();

            p.swingTime += dt;

            let movementDirection = p.direction.clone();

            // Swinging projectile moves in a curved side-to-side path.

            if (p.swing) {

                const side = new THREE.Vector3(
                    -p.direction.z,
                    0,
                    p.direction.x
                );

                movementDirection.add(
                    side.multiplyScalar(Math.sin(p.swingTime * 9) * 0.8)
                );

                movementDirection.normalize();
            }

            const movement = movementDirection.multiplyScalar(
                p.speed * dt
            );

            const end = start.clone().add(movement);

            p.life -= dt;
            p.distance += movement.length();

            let remove = false;

            if (projectileHitsWall(start, end)) {
                remove = true;
            }

            if (!remove) {

                for (const enemy of enemies) {

                    if (!enemy.alive) continue;

                    const target = new THREE.Vector3(
                        enemy.group.position.x,
                        enemy.group.position.y + 1.3,
                        enemy.group.position.z
                    );

                    if (
                        segmentDistance(target, start, end) < 0.8
                    ) {

                        damageEnemy(enemy, p.damage);
                        remove = true;

                        break;
                    }
                }
            }

            if (
                p.life <= 0 ||
                p.distance >= p.maxDistance
            ) {
                remove = true;
            }

            if (remove) {

                scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();

                projectiles.splice(i, 1);

            } else {

                p.mesh.position.copy(end);
            }
        }
    }

    // ==========================================
    // 16. Z — ENERGY BEAM
    // ==========================================

    let beamCooldown = 0;

    function fireBeam() {

        if (beamCooldown > 0) return;

        const origin = getPlayerOrigin();
        const direction = getAimDirection();

        let distance = 35;
        let hitEnemy = null;

        // Find the first wall hit.

        const ray = new THREE.Ray(origin, direction);

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

            const hit = ray.intersectBox(
                bounds,
                new THREE.Vector3()
            );

            if (hit) {
                distance = Math.min(
                    distance,
                    origin.distanceTo(hit)
                );
            }
        }

        // Find the nearest enemy along the beam.

        for (const enemy of enemies) {

            if (!enemy.alive) continue;

            const target = new THREE.Vector3(
                enemy.group.position.x,
                enemy.group.position.y + 1.3,
                enemy.group.position.z
            );

            const along = target.clone().sub(origin).dot(direction);

            if (along < 0 || along > distance) continue;

            const closest = origin.clone().add(
                direction.clone().multiplyScalar(along)
            );

            if (closest.distanceTo(target) < 1) {

                distance = along;
                hitEnemy = enemy;
            }
        }

        if (hitEnemy) {
            damageEnemy(hitEnemy, 35);
        }

        // Visible beam

        const end = origin.clone().add(
            direction.clone().multiplyScalar(distance)
        );

        const geometry = new THREE.BufferGeometry().setFromPoints([
            origin,
            end
        ]);

        const beam = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
                color: 0x36ffff
            })
        );

        scene.add(beam);

        setTimeout(() => {

            scene.remove(beam);
            geometry.dispose();
            beam.material.dispose();

        }, 120);

        beamCooldown = 1.2;
    }

    // ==========================================
    // 17. X — SWINGING PROJECTILE
    // ==========================================

    let swingCooldown = 0;

    function fireSwing() {

        if (swingCooldown > 0) return;

        createProjectile(
            getPlayerOrigin(),
            getAimDirection(),
            {
                speed: 17,
                damage: 45,
                color: 0xff8c32,
                size: 0.28,
                life: 2.5,
                maxDistance: 35,
                swing: true
            }
        );

        swingCooldown = 2;
    }

    // ==========================================
    // 18. C — SUPER DASH
    // ==========================================

    let dashCooldown = 0;

    function superDash() {

        if (dashCooldown > 0) return;

        const direction = getAimDirection();

        // Dash along the ground.

        direction.y = 0;

        if (direction.lengthSq() < 0.001) return;

        direction.normalize();

        const totalDistance = 14;
        const steps = 35;
        const stepDistance = totalDistance / steps;

        let travelled = 0;

        for (let i = 0; i < steps; i++) {

            const nextX =
                player.position.x + direction.x * stepDistance;

            const nextZ =
                player.position.z + direction.z * stepDistance;

            const boundedX = THREE.MathUtils.clamp(
                nextX,
                -53,
                53
            );

            const boundedZ = THREE.MathUtils.clamp(
                nextZ,
                -38,
                38
            );

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

            travelled += stepDistance;
        }

        dashCooldown = 4;

        notify(`SUPER DASH! ${travelled.toFixed(1)} units`);
    }

    // ==========================================
    // 19. ENEMY AI
    // ==========================================

    function updateEnemies(dt) {

        for (const enemy of enemies) {

            if (!enemy.alive) {

                enemy.respawn -= dt;

                if (enemy.respawn <= 0) {

                    enemy.health = 100;
                    enemy.alive = true;

                    enemy.group.position.set(
                        enemy.spawnX,
                        0,
                        enemy.spawnZ
                    );

                    scene.add(enemy.group);
                    scene.add(enemy.bar);
                }

                continue;
            }

            const difference = new THREE.Vector3(
                player.position.x - enemy.group.position.x,
                0,
                player.position.z - enemy.group.position.z
            );

            const distance = difference.length();

            enemy.cooldown -= dt;

            if (distance > 1.5 && distance < 30) {

                difference.normalize();

                const speed = 2.5;

                const nextX =
                    enemy.group.position.x + difference.x * speed * dt;

                const nextZ =
                    enemy.group.position.z + difference.z * speed * dt;

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

            if (
                distance < 1.8 &&
                enemy.cooldown <= 0 &&
                playerDamageCooldown <= 0
            ) {

                playerHealth -= 10;
                playerDamageCooldown = 0.8;

                updateHealth();

                notify("You were hit!");

                enemy.cooldown = 1.2;
            }

            enemy.bar.position.set(
                enemy.group.position.x,
                enemy.group.position.y + 2.7,
                enemy.group.position.z
            );

            enemy.bar.lookAt(camera.position);

            enemy.fill.scale.x = Math.max(
                0,
                enemy.health / 100
            );

            enemy.fill.position.x =
                -(1 - enemy.health / 100) * 0.5;
        }
    }

    // ==========================================
    // 20. CREDITS
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
        [-9, 1.8, 5],
        [-15, 2.8, 0],
        [-21, 3.8, -5],
        [-27, 4.8, -10],
        [9, 1.8, -5],
        [35, 2.1, 22],
        [42, 3.6, 17],
        [48, 5.1, 10]
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
    // 21. RESPAWN
    // ==========================================

    function checkPlayerHealth() {

        if (playerHealth > 0) return;

        playerHealth = maxHealth;

        player.position.set(0, 0, 30);

        velocityY = 0;
        grounded = true;

        updateHealth();

        notify("Respawned!");
    }

    // ==========================================
    // 22. ANIMATION
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
        beamCooldown = Math.max(0, beamCooldown - dt);
        swingCooldown = Math.max(0, swingCooldown - dt);
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
        // CAMERA ROTATION
        // --------------------------------------

        const cameraSpeed = 1.8;

        if (keys.ArrowLeft) {
            yaw -= cameraSpeed * dt;
        }

        if (keys.ArrowRight) {
            yaw += cameraSpeed * dt;
        }

        // IMPORTANT:
        // Up/down keys move the player, not the camera.
        // Mouse dragging is the only way to change pitch.

        pitch = THREE.MathUtils.clamp(
            pitch,
            -0.7,
            1.0
        );

        // --------------------------------------
        // MOVEMENT
        // --------------------------------------

        let forward = 0;
        let sideways = 0;

        if (keys.KeyW || keys.ArrowUp) forward += 1;
        if (keys.KeyS || keys.ArrowDown) forward -= 1;

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

        const moveX =
            (forwardX * forward + rightX * sideways) * speed;

        const moveZ =
            (forwardZ * forward + rightZ * sideways) * speed;

        const moving = inputLength > 0;

        // --------------------------------------
        // HORIZONTAL COLLISION
        // --------------------------------------

        const nextX = player.position.x + moveX * dt;

        if (!collidesAt(nextX, player.position.z, player.position.y)) {
            player.position.x = nextX;
        }

        const nextZ = player.position.z + moveZ * dt;

        if (!collidesAt(player.position.x, nextZ, player.position.y)) {
            player.position.z = nextZ;
        }

        // --------------------------------------
        // MAP BOUNDARIES
        // --------------------------------------

        player.position.x = THREE.MathUtils.clamp(
            player.position.x,
            -53,
            53
        );

        player.position.z = THREE.MathUtils.clamp(
            player.position.z,
            -38,
            38
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
                moveX,
                moveZ
            );
        }

        // --------------------------------------
        // ACTIONS
        // --------------------------------------

        if (shootQueued && !shopOpen) {
            shoot();
            shootQueued = false;
        }

        if (beamQueued && !shopOpen) {
            fireBeam();
            beamQueued = false;
        }

        if (swingQueued && !shopOpen) {
            fireSwing();
            swingQueued = false;
        }

        if (dashQueued && !shopOpen) {
            superDash();
            dashQueued = false;
        }

        // --------------------------------------
        // PROJECTILES
        // --------------------------------------

        updateProjectiles(dt);

        // --------------------------------------
        // ENEMIES
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

                money += 100;
                updateMoney();

                notify("+100 Credits");
            }
        }

        // --------------------------------------
        // CAMERA
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

        renderer.render(scene, camera);
    }

    // ==========================================
    // 23. RESIZE
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

    updateHealth();
    updateMoney();

    animate();

    // ==========================================
    // 24. CLEANUP
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
