/* Main script to manage game */

var tableau;
var message = [];
var action = [];
var interval;


/* ************ */
/* action management */
class ActionType {
    source;
    target;
    isPhaser=false;
    param=0;
    direction=0;
    damage=0;
    isTorpedo=false;
    isMoveSector=false;
    isMoveTableau=false;
    isBlink=false;
    sourceX;
    sourceY;
    currentMove=0;
    tableauMove=0;
    delay=TIME_MOVE;

    constructor() {
    }

    /* add a new phaser action from - to */
    addPhaser(s,t,p) {
        this.source = s;
        this.target = t;
        this.isPhaser=true;
        this.param=p;
        this.delay=TIME_PHASER;
    }

    /* add a movement sector */
    addMovementSector(s,d,t) {
        this.source = s;
        this.param = d;
        this.direction = t;
        this.isMoveSector = true;
        this.sourceX=this.source.localX;
        this.sourceY=this.source.localY;
        this.delay=TIME_MOVE;
    }

    /* add a movement tableau */
    addMovementTableau(s,d,t) {
        this.source = s;
        this.param = MOVE_SECTOR_TABLEAU;
        this.tableauMove = d;
        this.direction = t;
        this.isMoveTableau = true;
        this.sourceX=this.source.localX;
        this.sourceY=this.source.localY;
        this.delay=TIME_MOVE;
    }

    /* add a blink to an object */
    addBlink(s,t) {
        this.source = s;
        this.target = t;
        this.param = BLINK_TIMES;
        this.currentMove = 0;
        this.delay = TIME_BLINK;
        this.isBlink = true;
    }

    /* add a blink for a Torpedo */
    addTorpedo(s,t,d) {
        this.source = s;
        this.target = t;
        this.param = BLINK_TIMES;
        this.currentMove = 0;
        this.delay = TIME_BLINK;
        this.isBlink = true;
        this.isTorpedo = true;
        this.damage=d;
    }

}

/* add a new action */
function addAction(actionType) {
    action.push(actionType);
}

function resetAction() {
    action = [];
    refreshGame();
}

/* end turn and move date after all objects played */
function endTurn() {
    /* check if some Kipicks must play */
    if (tableau.isKipickTurn()) {
        tableau.playNextKipick();
        nextTurn();
    } else {
        /* ending turn */
        tableau.endTurnEnergy();
        tableau.setNextMonth();
        tableau.resetPlayTurn();
    }
    refreshGame();
}
/* function to management the events : movement, phaser, torpedo */
function nextTurn() {
    /* playing action turn */
    let delay=TIME_PHASER;
    if (action.length>0) {
        delay = action[0].delay;
    }
    /* setup the timer */ 
    interval = setInterval(function()
    { 
        /* check if turn is finished */
        if (action.length==0) {
            /* ending turn */
            clearInterval(interval);
            endTurn();
        } else {
            /* get last action */
            let actionType = action.pop();
            if (actionType.isPhaser) {
                doPhaserAction(actionType);
            } else if (actionType.isMoveSector) {
                doMovementSector(actionType);
            } else if (actionType.isMoveTableau) {
                doMovementTableau(actionType);
            } else if (actionType.isBlink) {
                doBlink(actionType);
            }
        }
        
    },delay);        
}

/* do a blink after a collision */
function doBlink(actionType) {
    actionType.source.focus=!actionType.source.focus;
    actionType.target.focus=!actionType.source.focus;
    actionType.currentMove++;
    /* check if continue movement */
    if (actionType.currentMove<actionType.param) {
        action.unshift(actionType);
    } else {
        actionType.source.focus=false;
        actionType.target.focus=false;
        /* check if this is a Torpedo Blink */
        if (actionType.isTorpedo) {
            actionType.target.collision(actionType.damage);
            actionType.source.status = ObjectStatus.destroyed;
            /* check if object is destroyed */
            if (!actionType.target.isAlive()) {
                let msg = TEXT_OBJECT_DESTROYED;
                msg=msg.replace("{OBJECT}",actionType.target.getName());               
                addMessage(msg+pos);
            }
        }
    }
    refreshGame();

}

/* manage a move in a tableau */
function doMovementTableau(actionType) {
    /* check if still some move in sector to do */
    if (actionType.currentMove<actionType.param) {
        doMovementSector(actionType);
    } else {
        let distance = actionType.tableauMove;
        let newX = Math.round(distance*Math.cos((actionType.direction-90)*Math.PI/180));
        let newY = Math.round(distance*Math.sin((actionType.direction-90)*Math.PI/180));    
        tableau.moveTableau(actionType.source,newX,newY);    
    }
}

/* manage the animation for movement sector */
function doMovementSector(actionType) {
    /* calculate new position */
    actionType.currentMove++;
    let distance = actionType.currentMove;
    let newX = Math.round(actionType.sourceX+distance*Math.cos((actionType.direction-90)*Math.PI/180));
    let newY = Math.round(actionType.sourceY+distance*Math.sin((actionType.direction-90)*Math.PI/180));
    let moveSector = false;
    let originalGlobalX = actionType.source.globalX;
    let originalGlobalY = actionType.source.globalY;
    /* check if this is a Torpedo outside of sector */
    if (actionType.source instanceof Torpedo) {
        if ((newX<0) || (newY<0) || (newX>=SECTOR_MAX_X) || (newY>=SECTOR_MAX_Y)) {
            actionType.source.status = ObjectStatus.destroyed;
            refreshGame();
            return;
        }
    }
    /* check if still inside the sector */
    if (newX < 0) {
        newX=SECTOR_MAX_X-1;
        tableau.moveTableau(actionType.source,-1,0);
        moveSector = true;
    }
    if (newX >= SECTOR_MAX_X) {
        newX=0;
        tableau.moveTableau(actionType.source,1,0);
        moveSector = true;
    }
    if (newY < 0) {
        newY=SECTOR_MAX_Y-1;
        tableau.moveTableau(actionType.source,0,-1);
        moveSector = true;
    }
    if (newY >= SECTOR_MAX_Y) {
        newY=0;
        tableau.moveTableau(actionType.source,0,1);
        moveSector = true;
    }
    /* check collision */
    if (tableau.checkCollision(actionType.source,newX,newY)) {
        let obj = tableau.getCollisionObject(newX,newY);
        /* check if source is a Torpedo */
        if (actionType.source instanceof Torpedo) {
            /* Torpedo damaged */
            let dam = ENERGY_TORPEDO * 3/4 + getRandomInt(ENERGY_TORPEDO/2);
            addMessage(TEXT_COLLISION_TORPEDO+dam+" - "+obj.getName());
            /* Blink action for a Torpedo */
            let actionType2 = new ActionType();
            actionType2.addTorpedo(actionType.source,obj,dam);
            addAction(actionType2);               
        } else {
        /* check if this is a Base */
            if (obj instanceof Base) {
                /* manage Base refuel */
                obj.status = ObjectStatus.destroyed;
                /* if this is for Endurci */
                if (actionType.source.generateMessage) {
                    tableau.endurci.takeBase();
                    addMessage(TEXT_BASE_REFUEL);
                    /* check if continue movement */
                    if ((actionType.currentMove<actionType.param) || (actionType.isMoveTableau)) {
                        action.unshift(actionType);
                    }
                } else {
                    addMessage(TEXT_BASE_DESTROYED+tableau.getCoo(obj.localX,obj.localY));
                }                 
            } else {
                /* manage collision with object */
                let dam = getRandomInt(ENERGY_COLLISION);
                actionType.source.collision(dam);
                if (actionType.source.generateMessage) {
                    addMessage(TEXT_COLLISION+dam+" - "+obj.getName());
                }
                /* blink collisioned object */
                let actionType2 = new ActionType();
                actionType2.addBlink(obj,actionType.source);
                addAction(actionType2);
                /* if needed, put back the tableau */
                actionType.source.globalX = originalGlobalX;
                actionType.source.globalY = originalGlobalY;
            }
        }
    } else {
        /* do the movement */
        actionType.source.localX=newX;
        actionType.source.localY=newY;
        /* new origin if needed */
        if (moveSector) {
            actionType.sourceX=newX;
            actionType.sourceY=newY;
            actionType.param-=actionType.currentMove 
            actionType.currentMove=0;
        }
        /* check if continue movement */
        if ((actionType.currentMove<actionType.param) || (actionType.isMoveTableau)) {
            action.unshift(actionType);
        }
    }
    /* cost of energy */
    actionType.source.energyCost(ENERGY_MOVEMENT_SECTOR);
    /* refresh the different parts */
    refreshGame();
}

/* manage the animation for phaser */
function doPhaserAction(actionType) {
    /* highlight current object */
    actionType.target.focus=true;
    actionType.source.focus=true;
    /* manage the collision */
    let msg = TEXT_PHASER_ACTION;
    msg=msg.replace("{OBJECT}",actionType.target.getName());
    msg+=actionType.param;
    addMessage(msg);
    /* refresh the different parts */
    refreshGame();
    actionType.target.collision(actionType.param);
    /* check if destroyed */
    if ((!actionType.target.isAlive()) && (actionType.target instanceof Kipick)) {
        let msg = TEXT_OBJECT_DESTROYED;
        msg=msg.replace("{OBJECT}",actionType.target.getName());
        addMessage(msg);
    }
    /* end of object highlight */
    actionType.target.focus=false;
    actionType.source.focus=false;
}

/* ************ */
/* add message */
function addMessage(msg) {
    let msgTxt = tableau.getGalacticTime();
    msgTxt += ": ";
    msgTxt += msg;
    message.unshift(msgTxt);
}

/* display last messages */
function displayLastMessage(nb) {
    let htmlResult = "<p>";
    for(let i=0;i < nb && message.length > i;i++) {
        htmlResult+=message[i]+"<br />";
    }
    htmlResult+="</p>";
    return htmlResult;
}  

/* *************** */
/* launch radar function */
function cmdRadar() {
    tableau.cmdRadar();
    refreshGame();
}

/* launch probe function */
function cmdProbe() {
    let probe = tableau.cmdProbe();
    if (probe!="") {
        document.getElementById('probe').innerHTML=probe;        
    }
}

/* change shield rate */
function cmdShield() {
    let shieldRateTxt = document.getElementById("inputShieldRate").value;
    tableau.cmdShield(shieldRateTxt);
    refreshGame();
}

/* launch Laser */
function cmdPhaser() {
    let laserTxt = document.getElementById("inputPhaser").value;
    tableau.cmdPhaser(laserTxt);
    nextTurn();
}

/* move sector */
function cmdMoveSector() {
    let inputDistanceSector = document.getElementById("inputDistanceSector").value;
    let inputDirectionSector = document.getElementById("inputDirectionSector").value;
    tableau.cmdMoveSector(inputDistanceSector,inputDirectionSector);
    nextTurn();
}

/* move tableau */
function cmdMoveTableau() {
    let inputDistanceSector = document.getElementById("inputDistanceTableau").value;
    let inputDirectionSector = document.getElementById("inputDirectionTableau").value;
    tableau.cmdMoveTableau(inputDistanceSector,inputDirectionSector);
    nextTurn();
}

/* ending turn */
function cmdPass() {
    endTurn();
}

/* Launch Torpedo */
function cmdTorpedo() {
    let inputDirectionTorpedo = document.getElementById("inputTorpedo").value;
    tableau.cmdTorpedo(inputDirectionTorpedo);
    nextTurn();
}

/* *************** */
/* start the game */
function startGame() {
    tableau = new Tableau();
    message = [];
    addMessage(TEXT_WELCOME);
    refreshGame();
}

/* refresh element */
function refreshGame() {
    document.getElementById('tableau').innerHTML=tableau.displayTableau();
    document.getElementById('sector').innerHTML=tableau.displaySector();
    document.getElementById('info').innerHTML=tableau.displayInfo();
    document.getElementById('damage').innerHTML=tableau.displayDamageInfo();
    document.getElementById('message').innerHTML=displayLastMessage(5);
    document.getElementById("inputShieldRate").value=tableau.endurci.shieldRate;
}

/* start game when loaded */
window.onload=function()
{
    startGame();
}


