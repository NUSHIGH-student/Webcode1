
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>World Nations</title>

<style>
* { box-sizing: border-box; }

body {
    margin: 0;
    background: #101722;
    color: #e8edf5;
    font-family: Arial, sans-serif;
}

header {
    height: 65px;
    background: #192536;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;
    border-bottom: 1px solid #34445a;
}

h1 { font-size: 21px; margin: 0; }
h2 { font-size: 17px; margin-top: 0; }

#stats {
    display: flex;
    gap: 22px;
    font-size: 14px;
}

#layout {
    display: grid;
    grid-template-columns: minmax(400px, 1fr) 310px;
    height: calc(100vh - 65px);
}

#mapArea {
    padding: 12px;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

#map {
    width: 100%;
    flex: 1;
    min-height: 300px;
    background: #172b3d;
    border: 1px solid #40536a;
    border-radius: 8px;
    cursor: crosshair;
}

#mapControls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding-top: 10px;
}

#sidebar {
    background: #192536;
    border-left: 1px solid #34445a;
    padding: 15px;
    overflow-y: auto;
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 16px;
}

button {
    background: #30445e;
    color: white;
    border: 1px solid #49617d;
    padding: 9px 11px;
    border-radius: 5px;
    cursor: pointer;
}

button:hover { background: #416287; }
button:disabled { opacity: .4; cursor: not-allowed; }

.tab.active { background: #2879b9; }

.panel { display: none; }
.panel.active { display: block; }

.stat {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #34445a;
    font-size: 13px;
}

.stat span:last-child {
    text-align: right;
    color: #8ed4ff;
}

.action {
    display: block;
    width: 100%;
    margin-top: 9px;
    text-align: left;
}

.small {
    color: #aebed0;
    font-size: 12px;
    line-height: 1.5;
}

input[type="range"] { width: 100%; }

#log {
    background: #101b29;
    border-radius: 5px;
    padding: 10px;
    font-size: 12px;
    max-height: 130px;
    overflow-y: auto;
    margin-top: 15px;
}

#log p { margin: 5px 0; }

.country {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 7px 0;
    font-size: 13px;
}

.swatch {
    width: 13px;
    height: 13px;
    border-radius: 3px;
}

@media(max-width: 850px) {
    #layout { grid-template-columns: 1fr; height: auto; }
    #mapArea { height: 65vh; }
    #sidebar { border-left: 0; border-top: 1px solid #34445a; }
    #stats { gap: 8px; font-size: 11px; }
}
</style>
</head>

<body>

<header>
    <h1>WORLD NATIONS</h1>
    <div id="stats">
        <span id="date">Year 1 / January</span>
        <span id="money">Credits: 0</span>
        <span id="income">Income: 0</span>
    </div>
    <button onclick="nextTurn()">Next Month ▶</button>
</header>

<div id="layout">

    <main id="mapArea">
        <canvas id="map"></canvas>

        <div id="mapControls">
            <button onclick="zoomMap(1.2)">Zoom +</button>
            <button onclick="zoomMap(0.8)">Zoom −</button>
            <button onclick="resetMap()">Reset map</button>
            <button onclick="toggleMapMode()">Toggle country view</button>
        </div>
    </main>

    <aside id="sidebar">

        <div class="tabs">
            <button class="tab active" onclick="showTab('tile',this)">Tile</button>
            <button class="tab" onclick="showTab('economy',this)">Economy</button>
            <button class="tab" onclick="showTab('military',this)">Military</button>
            <button class="tab" onclick="showTab('research',this)">Research</button>
            <button class="tab" onclick="showTab('diplomacy',this)">Diplomacy</button>
            <button class="tab" onclick="showTab('ships',this)">Navy</button>
        </div>

        <section id="tile" class="panel active">
            <h2>Selected Tile</h2>
            <div id="tileInfo" class="small">Select a tile on the map.</div>
            <div id="tileActions"></div>
        </section>

        <section id="economy" class="panel">
            <h2>National Economy</h2>
            <div id="economyInfo"></div>

            <h3>Government budget</h3>
            <p class="small">Military allocation: <span id="budgetLabel">20%</span></p>
            <input id="budget" type="range" min="0" max="60" value="20"
                oninput="changeBudget(this.value)">
            <button class="action" onclick="buildHousing()">Build housing (+500,000 capacity)</button>
            <button class="action" onclick="buildInfrastructure()">Improve infrastructure</button>
        </section>

        <section id="military" class="panel">
            <h2>Military Command</h2>
            <div id="militaryInfo"></div>
            <p class="small">Select one of your cities, then select an adjacent tile on the map to move troops.</p>
            <button class="action" onclick="recruitTroops()">Recruit 1,000 troops</button>
            <button class="action" onclick="declareWar()">Declare war on selected country</button>
        </section>

        <section id="research" class="panel">
            <h2>Research Centre</h2>
            <div id="researchInfo"></div>
            <div id="researchActions"></div>
        </section>

        <section id="diplomacy" class="panel">
            <h2>Diplomacy</h2>
            <div id="diplomacyInfo"></div>
            <p class="small">War allows your armies to enter enemy territory. Peace and alliances can be expanded in a future version.</p>
        </section>

        <section id="ships" class="panel">
            <h2>Naval Command</h2>
            <div id="shipInfo"></div>
            <p class="small">Ships can only occupy water tiles. Select a port city to construct vessels. Select a ship and then a connected water tile to move it.</p>
            <div id="shipActions"></div>
        </section>

        <div id="log">
            <strong>Event Log</strong>
            <div id="logMessages"></div>
        </div>

    </aside>
</div>

<script>
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const COLS = 15;
const ROWS = 9;

const countryData = [
    {name:"Aurelia", color:"#d65c5c"},
    {name:"Nordland", color:"#5189d5"},
    {name:"Vesper", color:"#51a77c"},
    {name:"Solaria", color:"#b18a4b"},
    {name:"Eastreach", color:"#9568c9"}
];

const countries = countryData.map((c,i)=>({
    ...c,
    id:i,
    money: i===0 ? 30000 : 25000,
    taxRate: 0.08,
    militaryBudget: 0.20,
    researchPoints: 0,
    military: 0,
    factories: 0,
    income: 0,
    atWar: new Set(),
    research: {
        military:0,
        industry:0,
        housing:0,
        logistics:0,
        naval:0
    },
    ai: i!==0
}));

const player = countries[0];

let tiles = [];
let cities = [];
let ships = [];
let selectedTile = null;
let selectedShip = null;
let turn = 0;
let mapScale = 1;
let showPopulation = false;

const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

const TILE_W = 66;
const TILE_H = 57;
const START_X = 25;
const START_Y = 20;

function rand(min,max) {
    return min + Math.random()*(max-min);
}

function format(n) {
    return Math.floor(n).toLocaleString("en-US");
}

function log(message) {
    const div = document.createElement("p");
    div.textContent = message;
    document.getElementById("logMessages").prepend(div);

    const messages = document.getElementById("logMessages");
    while(messages.children.length > 35) {
        messages.lastChild.remove();
    }
}

// Generate shared irregular vertices.
// Each tile shares its edges with its neighbours.
function generateWorld() {
    const vertices = [];

    for(let y=0;y<=ROWS;y++) {
        vertices[y]=[];

        for(let x=0;x<=COLS;x++) {
            const px = START_X+x*TILE_W+
                (x===0||x===COLS ? 0 : rand(-9,9));

            const py = START_Y+y*TILE_H+
                (y===0||y===ROWS ? 0 : rand(-8,8));

            vertices[y][x]={x:px,y:py};
        }
    }

    for(let y=0;y<ROWS;y++) {
        for(let x=0;x<COLS;x++) {

            const points = [
                vertices[y][x],
                vertices[y][x+1],
                vertices[y+1][x+1],
                vertices[y+1][x]
            ];

            // Outer rows are sea. A central channel forms a strait.
            const water =
                y===0 ||
                y===ROWS-1 ||
                (x===7 && y>=2 && y<=6);

            const countryId = Math.min(4,Math.floor(x/3));

            const population = water ? 0 : Math.floor(rand(30000,220000));

            tiles.push({
                id:y*COLS+x,
                x,y,
                points,
                cx:points.reduce((s,p)=>s+p.x,0)/4,
                cy:points.reduce((s,p)=>s+p.y,0)/4,
                water,
                owner:water ? -1 : countryId,
                population,
                factories:0,
                housing:0,
                infrastructure:0,
                troops:0,
                city:null,
                neighbours:[],
                ships:[]
            });
        }
    }

    // Tile adjacency.
    for(const tile of tiles) {
        const candidates = [
            [tile.x-1,tile.y],
            [tile.x+1,tile.y],
            [tile.x,tile.y-1],
            [tile.x,tile.y+1]
        ];

        for(const [x,y] of candidates) {
            if(x>=0&&x<COLS&&y>=0&&y<ROWS) {
                tile.neighbours.push(tiles[y*COLS+x]);
            }
        }
    }

    createCities();
}

function createCities() {
    // One capital and several ordinary cities for each country.
    for(let countryId=0;countryId<5;countryId++) {

        const startX=countryId*3;
        const candidates=tiles.filter(t=>
            !t.water&&t.owner===countryId
        );

        // Capital near the centre of each country.
        const capital=candidates.find(t=>
            t.x===startX+1&&t.y===4
        ) || candidates[0];

        makeCity(capital,true);

        const cityPositions=[
            [startX,2],
            [startX+2,3],
            [startX,6]
        ];

        for(const [x,y] of cityPositions) {
            const tile=tiles[y*COLS+x];
            if(tile&&!tile.water&&!tile.city) makeCity(tile,false);
        }
    }
}

function makeCity(tile,isCapital) {
    const city={
        tile,
        owner:tile.owner,
        isCapital,
        isPort:tile.neighbours.some(n=>n.water),
        population:isCapital ? Math.floor(rand(1500000,3000000))
            : Math.floor(rand(300000,1200000)),
        capacity:10000000,
        infrastructure:0,
        troops:0,
        ships:[],
        portLevel:0
    };

    tile.city=city;
    tile.population=city.population;
    cities.push(city);
}

function resize() {
    const rect=canvas.getBoundingClientRect();
    const dpr=window.devicePixelRatio||1;

    canvas.width=rect.width*dpr;
    canvas.height=rect.height*dpr;

    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawMap();
}

window.addEventListener("resize",resize);

function drawMap() {
    const rect=canvas.getBoundingClientRect();
    const width=rect.width;
    const height=rect.height;

    ctx.clearRect(0,0,width,height);

    ctx.save();
    ctx.translate((width-width*mapScale)/2,(height-height*mapScale)/2);
    ctx.scale(mapScale,mapScale);

    // Water background.
    ctx.fillStyle="#183b59";
    ctx.fillRect(0,0,width/mapScale,height/mapScale);

    for(const tile of tiles) {
        ctx.beginPath();
        tile.points.forEach((p,i)=>{
            if(i===0) ctx.moveTo(p.x,p.y);
            else ctx.lineTo(p.x,p.y);
        });
        ctx.closePath();

        if(tile.water) {
            ctx.fillStyle="#204d70";
        } else {
            const owner=countries[tile.owner];
            ctx.fillStyle=owner ? owner.color : "#777";
        }

        ctx.fill();

        ctx.lineWidth=1.1;
        ctx.strokeStyle="#17202b";
        ctx.stroke();

        // Country borders are thicker.
        for(const n of tile.neighbours) {
            if(!tile.water&&!n.water&&tile.owner!==n.owner) {
                ctx.beginPath();
                ctx.moveTo(tile.cx,tile.cy);
                ctx.lineTo(n.cx,n.cy);
                ctx.strokeStyle="#f1e9dc";
                ctx.lineWidth=3;
                ctx.stroke();
            }
        }

        // Selected tile.
        if(tile===selectedTile) {
            ctx.beginPath();
            tile.points.forEach((p,i)=>{
                if(i===0) ctx.moveTo(p.x,p.y);
                else ctx.lineTo(p.x,p.y);
            });
            ctx.closePath();
            ctx.strokeStyle="#ffffff";
            ctx.lineWidth=3;
            ctx.stroke();
        }

        if(!tile.water) {
            if(tile.city) {
                ctx.fillStyle="#ffffff";

                if(tile.city.isCapital) {
                    drawStar(tile.cx,tile.cy,9);
                } else {
                    ctx.beginPath();
                    ctx.arc(tile.cx,tile.cy,5,0,Math.PI*2);
                    ctx.fill();
                }

                // Port symbol.
                if(tile.city.isPort) {
                    ctx.fillStyle="#36e0e9";
                    ctx.fillRect(tile.cx+7,tile.cy-12,5,5);
                }

                // Troop count.
                if(tile.city.troops>0) {
                    ctx.fillStyle="#fff";
                    ctx.font="10px Arial";
                    ctx.fillText("⚔ "+Math.floor(tile.city.troops/1000)+"k",
                        tile.cx-12,tile.cy+22);
                }
            }

            if(showPopulation) {
                ctx.fillStyle="#fff";
                ctx.font="9px Arial";
                ctx.fillText(Math.round(tile.population/1000)+"k",
                    tile.cx-12,tile.cy-12);
            }
        }

        // Ships.
        for(const ship of ships.filter(s=>s.tile===tile)) {
            ctx.fillStyle="#f7f5e8";
            ctx.font="15px Arial";
            ctx.fillText("◆",tile.cx-5,tile.cy+5);

            if(ship===selectedShip) {
                ctx.beginPath();
                ctx.arc(tile.cx,tile.cy,12,0,Math.PI*2);
                ctx.strokeStyle="#fff";
                ctx.lineWidth=2;
                ctx.stroke();
            }
        }
    }

    // Country names.
    for(let i=0;i<5;i++) {
        const countryTiles=tiles.filter(t=>!t.water&&t.owner===i);
        if(countryTiles.length===0) continue;

        const cx=countryTiles.reduce((s,t)=>s+t.cx,0)/countryTiles.length;
        const cy=countryTiles.reduce((s,t)=>s+t.cy,0)/countryTiles.length;

        ctx.fillStyle="rgba(255,255,255,.75)";
        ctx.font="bold 12px Arial";
        ctx.textAlign="center";
        ctx.fillText(countries[i].name,cx,cy-25);
    }

    ctx.restore();
}

function drawStar(x,y,r) {
    ctx.beginPath();

    for(let i=0;i<10;i++) {
        const radius=i%2===0?r:r*0.45;
        const angle=-Math.PI/2+i*Math.PI/5;
        const px=x+Math.cos(angle)*radius;
        const py=y+Math.sin(angle)*radius;

        if(i===0) ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
    }

    ctx.closePath();
    ctx.fill();
}

function zoomMap(factor) {
    mapScale=Math.max(0.65,Math.min(2,mapScale*factor));
    drawMap();
}

function resetMap() {
    mapScale=1;
    drawMap();
}

function toggleMapMode() {
    showPopulation=!showPopulation;
    drawMap();
}

function selectAt(mx,my) {
    const rect=canvas.getBoundingClientRect();

    const x=(mx-rect.left-(rect.width-rect.width*mapScale)/2)/mapScale;
    const y=(my-rect.top-(rect.height-rect.height*mapScale)/2)/mapScale;

    let found=null;

    // Point-in-polygon test.
    for(const tile of tiles) {
        let inside=false;
        const p=tile.points;

        for(let i=0,j=p.length-1;i<p.length;j=i++) {
            if(((p[i].y>y)!==(p[j].y>y))&&
                x<(p[j].x-p[i].x)*(y-p[i].y)/(p[j].y-p[i].y)+p[i].x) {
                inside=!inside;
            }
        }

        if(inside) {
            found=tile;
            break;
        }
    }

    if(!found) return;

    if(selectedShip) {
        if(found.water) {
            moveShip(selectedShip,found);
            selectedShip=null;
            updateUI();
            return;
        }
        selectedShip=null;
    }

    if(selectedTile&&selectedTile.city&&
        selectedTile.owner===0&&found.owner!==0&&
        selectedTile.city.troops>0) {
        moveTroops(selectedTile,found);
    }

    selectedTile=found;
    updateUI();
    drawMap();
}

canvas.addEventListener("click",e=>selectAt(e.clientX,e.clientY));

function showTab(id,button) {
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));

    document.getElementById(id).classList.add("active");
    button.classList.add("active");
    updateUI();
}

// ECONOMY

function factoryLimit(tile) {
    return Math.floor(2*tile.population/100000);
}

function totalPopulation(country) {
    return tiles.filter(t=>t.owner===country.id)
        .reduce((s,t)=>s+t.population,0);
}

function totalFactories(country) {
    return tiles.filter(t=>t.owner===country.id)
        .reduce((s,t)=>s+t.factories,0);
}

function calculateIncome(country) {
    const pop=totalPopulation(country);

    const tax=pop*country.taxRate*0.08;
    const factoryIncome=totalFactories(country)*500;
    const tradeIncome=ships
        .filter(s=>s.owner===country.id&&s.type==="Trade Ship")
        .length*200;

    return Math.floor(tax+factoryIncome+tradeIncome);
}

function changeBudget(value) {
    player.militaryBudget=Number(value)/100;
    document.getElementById("budgetLabel").textContent=value+"%";
}

function buildFactory() {
    const t=selectedTile;

    if(!t||t.owner!==0||t.water) return;

    if(t.factories>=factoryLimit(t)) {
        log("This tile has reached its factory limit.");
        return;
    }

    if(player.money<1000) return log("Not enough money.");

    player.money-=1000;
    t.factories++;
    log("Factory constructed.");
    updateUI();
    drawMap();
}

function buildHousing() {
    const t=selectedTile;

    if(!t||!t.city||t.owner!==0) return;
    if(player.money<3000) return log("Not enough money.");

    player.money-=3000;
    t.city.capacity+=500000;
    t.city.infrastructure++;
    log("Housing capacity increased.");
    updateUI();
}

function buildInfrastructure() {
    const t=selectedTile;

    if(!t||!t.city||t.owner!==0) return;
    if(player.money<2500) return log("Not enough money.");

    player.money-=2500;
    t.city.infrastructure++;
    t.city.capacity+=100000;
    log("Infrastructure improved.");
    updateUI();
}

// CAPITAL

function changeCapital() {
    const t=selectedTile;

    if(!t||!t.city||t.owner!==0) return;
    if(t.city.isCapital) return log("This is already your capital.");
    if(player.money<5000) return log("Not enough money.");

    const old=cities.find(c=>c.owner===0&&c.isCapital);

    if(old) old.isCapital=false;

    t.city.isCapital=true;
    player.money-=5000;

    log("Capital relocated to a new city.");
    updateUI();
    drawMap();
}

// RESEARCH

const researchData = [
    {id:"military",name:"Military Technology",cost:5000,desc:"+10% troop strength per level."},
    {id:"industry",name:"Industrial Technology",cost:4000,desc:"+10% factory income per level."},
    {id:"housing",name:"Urban Planning",cost:3500,desc:"+5% housing capacity per level."},
    {id:"logistics",name:"Military Logistics",cost:4500,desc:"+10% troop movement effectiveness."},
    {id:"naval",name:"Naval Engineering",cost:5000,desc:"+10% naval effectiveness."}
];

function research(id) {
    const r=researchData.find(x=>x.id===id);
    if(!r) return;

    if(player.money<r.cost) return log("Insufficient funds for research.");

    player.money-=r.cost;
    player.research[id]++;
    log("Research completed: "+r.name);
    updateUI();
}

// MILITARY

function manpower(country) {
    return Math.floor(totalPopulation(country)*0.05);
}

function totalTroops(country) {
    return tiles.filter(t=>t.owner===country.id)
        .reduce((s,t)=>s+(t.city?t.city.troops:0),0);
}

function recruitTroops() {
    const t=selectedTile;

    if(!t||!t.city||t.owner!==0) {
        return log("Select one of your cities first.");
    }

    if(totalTroops(player)+1000>manpower(player)) {
        return log("Insufficient available manpower.");
    }

    if(player.money<1000) return log("Not enough money.");

    player.money-=1000;
    t.city.troops+=1000;
    log("1,000 troops recruited in "+player.name+".");
    updateUI();
    drawMap();
}

function declareWar() {
    if(!selectedTile||selectedTile.owner<=0) {
        return log("Select an enemy country's tile.");
    }

    const enemy=countries[selectedTile.owner];

    if(player.atWar.has(enemy.id)) {
        return log("You are already at war.");
    }

    player.atWar.add(enemy.id);
    enemy.atWar.add(player.id);

    log("WAR DECLARED against "+enemy.name+"!");
    updateUI();
}

function troopStrength(country,amount) {
    return amount*(1+country.research.military*0.10)*
        (1+country.research.logistics*0.10);
}

function moveTroops(from,to) {
    if(!from.city||from.city.troops<=0||from.owner!==0) return;

    if(!from.neighbours.includes(to)) {
        return log("Troops can only move to adjacent tiles.");
    }

    if(to.water) return log("Land troops cannot enter water.");
    if(to.owner!==0&&!player.atWar.has(to.owner)) {
        return log("You must declare war before entering enemy territory.");
    }

    const amount=from.city.troops;
    from.city.troops=0;

    if(to.owner===0) {
        if(!to.city) {
            makeCity(to,false);
        }
        to.city.troops+=amount;
        log("Troops moved to friendly territory.");
    } else {
        const enemy=countries[to.owner];
        const defenders=to.city?to.city.troops:0;

        const attack=troopStrength(player,amount)*rand(0.85,1.15);
        const defence=troopStrength(enemy,defenders+500)*rand(0.85,1.15);

        if(attack>defence) {
            to.owner=0;

            if(to.city) {
                to.city.owner=0;
                to.city.troops=amount-defenders;
                to.city.isCapital=false;
            } else {
                makeCity(to,false);
                to.city.troops=amount-defenders;
            }

            log("Victory! Territory captured from "+enemy.name+".");

            if(!tiles.some(t=>t.owner===enemy.id)) {
                log(enemy.name+" has lost all its territory!");
            }
        } else {
            log("Your attack on "+enemy.name+" was unsuccessful.");
        }
    }

    updateUI();
    drawMap();
}

// NAVY

const shipTypes = [
    {name:"Aircraft Carrier",cost:6000,maintenance:100,capacity:10000},
    {name:"Trade Ship",cost:500,maintenance:10,capacity:0},
    {name:"Destroyer",cost:1500,maintenance:25,capacity:0},
    {name:"Submarine",cost:2000,maintenance:30,capacity:0},
    {name:"Battleship",cost:4000,maintenance:60,capacity:0}
];

function buildShip(typeName) {
    const t=selectedTile;
    const type=shipTypes.find(s=>s.name===typeName);

    if(!t||!t.city||t.owner!==0||!t.city.isPort) {
        return log("Select one of your port cities.");
    }

    if(player.money<type.cost) return log("Insufficient funds.");

    const water=t.neighbours.find(n=>n.water);

    if(!water) return log("No adjacent water tile.");

    player.money-=type.cost;

    const ship={
        id:Date.now()+Math.random(),
        type:type.name,
        owner:0,
        tile:water,
        capacity:type.capacity,
        troops:0,
        maintenance:type.maintenance
    };

    ships.push(ship);
    water.ships.push(ship);
    t.city.ships.push(ship);

    log(type.name+" constructed at your port.");
    updateUI();
    drawMap();
}

function moveShip(ship,to) {
    if(!to.water) return;

    if(!ship.tile.neighbours.includes(to)) {
        return log("Ships can only move to adjacent water tiles.");
    }

    if(to.ships.some(s=>s.owner!==ship.owner)) {
        log("Enemy vessel encountered. Naval combat begins.");

        const enemy=to.ships.find(s=>s.owner!==ship.owner);
        const a=shipTypes.find(s=>s.name===ship.type);
        const b=shipTypes.find(s=>s.name===enemy.type);

        const ownStrength=a.cost*rand(.8,1.2);
        const enemyStrength=b.cost*rand(.8,1.2);

        if(ownStrength>enemyStrength) {
            ships=ships.filter(s=>s!==enemy);
            to.ships=to.ships.filter(s=>s!==enemy);
            log("Enemy vessel defeated.");
        } else {
            ships=ships.filter(s=>s!==ship);
            ship.tile.ships=ship.tile.ships.filter(s=>s!==ship);
            log("Your vessel was defeated.");
            return;
        }
    }

    ship.tile.ships=ship.tile.ships.filter(s=>s!==ship);
    ship.tile=to;
    to.ships.push(ship);

    log(ship.type+" moved.");
    updateUI();
    drawMap();
}

// POPULATION

function updatePopulation() {
    for(const city of cities) {
        const owner=countries[city.owner];

        let K=city.capacity+
            city.capacity*owner.research.housing*0.05;

        const r=0.0015;

        // Logistic growth, applied monthly.
        const growth=r*city.population*(1-city.population/K);

        city.population=Math.min(K,Math.max(0,city.population+growth));

        city.tile.population=city.population;
    }
}

// AI

function runAI(country) {
    if(!country.ai) return;

    const income=calculateIncome(country);
    country.money+=income;

    const militaryFunds=income*0.20;
    const civilianFunds=income*0.45;
    const researchFunds=income*0.15;

    // Research occasionally.
    if(country.money>12000&&Math.random()<0.25) {
        const choices=["military","industry","housing","logistics","naval"];
        const id=choices[Math.floor(Math.random()*choices.length)];
        country.research[id]++;
        country.money-=3000;
    }

    // Build factories.
    const possible=tiles.filter(t=>
        t.owner===country.id&&
        !t.water&&
        t.factories<factoryLimit(t)
    );

    if(possible.length&&country.money>3000&&Math.random()<0.65) {
        const t=possible[Math.floor(Math.random()*possible.length)];
        t.factories++;
        country.money-=1000;
    }

    // Recruit troops in cities.
    const available=cities.filter(c=>c.owner===country.id);

    const current=totalTroops(country);
    const cap=manpower(country);

    if(available.length&&current+1000<=cap&&
        country.money>1000&&militaryFunds>1000) {
        const city=available[Math.floor(Math.random()*available.length)];
        city.troops+=1000;
        country.money-=1000;
    }

    // Build a ship occasionally if a port is available.
    const ports=cities.filter(c=>c.owner===country.id&&c.isPort);

    if(ports.length&&country.money>6000&&Math.random()<0.15) {
        const port=ports[Math.floor(Math.random()*ports.length)];
        const water=port.tile.neighbours.find(t=>t.water);

        if(water) {
            const ship={
                id:Date.now()+Math.random(),
                type:"Trade Ship",
                owner:country.id,
                tile:water,
                capacity:0,
                troops:0,
                maintenance:10
            };

            ships.push(ship);
            water.ships.push(ship);
            port.ships.push(ship);
            country.money-=500;
        }
    }

    // Unused allocations remain in the treasury.
    void civilianFunds;
    void researchFunds;
}

// MONTHLY SIMULATION

function nextTurn() {
    turn++;

    updatePopulation();

    for(const country of countries) {
        const income=calculateIncome(country);

        if(country.ai) {
            // runAI calculates and adds its own income.
            runAI(country);
        } else {
            country.money+=income;
            country.income=income;
        }

        // Maintenance.
        const upkeep=ships
            .filter(s=>s.owner===country.id)
            .reduce((sum,s)=>sum+s.maintenance,0);

        country.money-=upkeep;

        // Military spending represents an allocation.
        if(!country.ai) {
            const militarySpending=income*country.militaryBudget;
            country.money-=militarySpending*0.05;
        }
    }

    if(turn%12===0) {
        log("A new year has begun.");
    }

    // Simple AI territorial awareness.
    if(turn%6===0) {
        for(const country of countries) {
            if(!country.ai) continue;

            const stronger=totalTroops(country)>totalTroops(player)*1.5;

            if(stronger&&Math.random()<0.08) {
                country.atWar.add(0);
                player.atWar.add(country.id);
                log(country.name+" has declared war on you!");
            }
        }
    }

    updateUI();
    drawMap();
}

// UI

function updateUI() {
    document.getElementById("date").textContent=
        "Year "+(Math.floor(turn/12)+1)+" / "+months[turn%12];

    document.getElementById("money").textContent=
        "Credits: "+format(player.money);

    player.income=calculateIncome(player);

    document.getElementById("income").textContent=
        "Income: "+format(player.income);

    updateTilePanel();
    updateEconomyPanel();
    updateMilitaryPanel();
    updateResearchPanel();
    updateDiplomacyPanel();
    updateShipPanel();
}

function updateTilePanel() {
    const info=document.getElementById("tileInfo");
    const actions=document.getElementById("tileActions");

    actions.innerHTML="";

    if(!selectedTile) {
        info.textContent="Select a tile on the map.";
        return;
    }

    const t=selectedTile;
    const country=t.owner>=0?countries[t.owner]:null;

    info.innerHTML=`
        <div class="stat"><span>Tile ID</span><span>${t.id}</span></div>
        <div class="stat"><span>Terrain</span><span>${t.water?"Water":"Land"}</span></div>
        <div class="stat"><span>Owner</span><span>${country?country.name:"Open sea"}</span></div>
        <div class="stat"><span>Population</span><span>${format(t.population)}</span></div>
        <div class="stat"><span>Factories</span><span>${t.factories} / ${factoryLimit(t)}</span></div>
        <div class="stat"><span>Troops</span><span>${t.city?format(t.city.troops):0}</span></div>
        <div class="stat"><span>City</span><span>${t.city?(t.city.isCapital?"Capital":t.city.isPort?"Port city":"City"):"None"}</span></div>
    `;

    if(t.owner===0&&!t.water) {
        actions.innerHTML+=`<button class="action" onclick="buildFactory()">Build factory (1,000)</button>`;

        if(t.city) {
            actions.innerHTML+=`<button class="action" onclick="changeCapital()">Make capital (5,000)</button>`;
            actions.innerHTML+=`<button class="action" onclick="recruitTroops()">Recruit troops</button>`;
            actions.innerHTML+=`<button class="action" onclick="buildHousing()">Build housing (3,000)</button>`;
        }
    }
}

function updateEconomyPanel() {
    const info=document.getElementById("economyInfo");

    info.innerHTML=`
        <div class="stat"><span>Population</span><span>${format(totalPopulation(player))}</span></div>
        <div class="stat"><span>Tax rate</span><span>${(player.taxRate*100).toFixed(1)}%</span></div>
        <div class="stat"><span>Factories</span><span>${totalFactories(player)}</span></div>
        <div class="stat"><span>Monthly income</span><span>${format(calculateIncome(player))}</span></div>
        <div class="stat"><span>Treasury</span><span>${format(player.money)}</span></div>
        <div class="stat"><span>Military budget</span><span>${(player.militaryBudget*100).toFixed(0)}%</span></div>
    `;
}

function updateMilitaryPanel() {
    document.getElementById("militaryInfo").innerHTML=`
        <div class="stat"><span>Total troops</span><span>${format(totalTroops(player))}</span></div>
        <div class="stat"><span>Available manpower</span><span>${format(manpower(player))}</span></div>
        <div class="stat"><span>Military technology</span><span>${player.research.military}</span></div>
        <div class="stat"><span>Countries at war</span><span>${player.atWar.size}</span></div>
    `;
}

function updateResearchPanel() {
    const info=document.getElementById("researchInfo");
    const actions=document.getElementById("researchActions");

    info.innerHTML=`
        <div class="stat"><span>Research points</span><span>${format(player.researchPoints)}</span></div>
        <div class="stat"><span>Military</span><span>${player.research.military}</span></div>
        <div class="stat"><span>Industry</span><span>${player.research.industry}</span></div>
        <div class="stat"><span>Housing</span><span>${player.research.housing}</span></div>
        <div class="stat"><span>Logistics</span><span>${player.research.logistics}</span></div>
        <div class="stat"><span>Naval</span><span>${player.research.naval}</span></div>
    `;

    actions.innerHTML="";

    for(const r of researchData) {
        actions.innerHTML+=`
            <button class="action" onclick="research('${r.id}')">
                ${r.name} - ${format(r.cost)} Credits
                <div class="small">${r.desc}</div>
            </button>
        `;
    }
}

function updateDiplomacyPanel() {
    const info=document.getElementById("diplomacyInfo");

    info.innerHTML=countries.map(c=>`
        <div class="country">
            <div class="swatch" style="background:${c.color}"></div>
            <span>${c.name}</span>
            <span style="margin-left:auto">
                ${c.id===0?"You":player.atWar.has(c.id)?"At war":"Peace"}
            </span>
        </div>
    `).join("");
}

function updateShipPanel() {
    const info=document.getElementById("shipInfo");
    const actions=document.getElementById("shipActions");

    const ownShips=ships.filter(s=>s.owner===0);

    info.innerHTML=`
        <div class="stat"><span>Total ships</span><span>${ownShips.length}</span></div>
        ${shipTypes.map(type=>`
            <div class="stat">
                <span>${type.name}</span>
                <span>${ownShips.filter(s=>s.type===type.name).length}</span>
            </div>
        `).join("")}
    `;

    actions.innerHTML=shipTypes.map(type=>`
        <button class="action" onclick="buildShip('${type.name}')">
            Build ${type.name} (${format(type.cost)})
        </button>
    `).join("");
}

// INITIALISATION

generateWorld();
resize();
updateUI();
log("Welcome to World Nations.");
log("You control Aurelia. Develop your economy and expand your country.");

</script>
</body>
</html>
