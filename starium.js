/* Main script to manage game */

var tableau;
var message = [];
var action = [];
var interval = [];
var cmdLevel = 0;
var cmdLevel2;
var cmdLevel3;
var cmdRequest;
var activeGame = false;


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

/* check condition for victory */
function checkVictory() {
    /* check if Endurci is destroyed */
    if (tableau.endurci.status == ObjectStatus.destroyed) {
        var modalLose = new bootstrap.Modal(document.getElementById('modalEndLose'), {
            keyboard: false
          })      
        modalLose.show();
        cmdCloseGame();
    }
    /* check Victory */
    if (tableau.getNumKipick()==0) {
        var modalEndWin = new bootstrap.Modal(document.getElementById('modalEndWin'), {
            keyboard: false
          })      
          modalEndWin.show();  
          cmdCloseGame();      
    }
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
        tableau.repair();
        tableau.setNextMonth();
        tableau.resetPlayTurn();
    }
    refreshGame();
    checkVictory();
}
/* function to management the events : movement, phaser, torpedo */
function nextTurn() {
    /* playing action turn */
    let delay=TIME_PHASER;
    if (action.length>0) {
        delay = action[0].delay;
    }
    /* setup the timer */ 
    interval.push(setInterval(function()
    { 
        /* check if turn is finished */
        if (action.length==0) {
            /* ending turn */
            clearInterval(interval.pop());
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
        
    },delay));        
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
                addMessage(msg);
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
    /* check if number is correct */
    if (isNaN(parseInt(shieldRateTxt))) {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }    
    tableau.cmdShield(shieldRateTxt);
    refreshGame();
}

/* launch Laser */
function cmdPhaser() {
    let laserTxt = document.getElementById("inputPhaser").value;
    /* check if number is correct */
    if (isNaN(parseInt(phaserRate))) {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }
    tableau.cmdPhaser(laserTxt);
    nextTurn();
}

/* move sector */
function cmdMoveSector() {
    let inputDistanceSector = document.getElementById("inputDistanceSector").value;
    let inputDirectionSector = document.getElementById("inputDirectionSector").value;
    /* check if number is correct */
    if ((isNaN(parseInt(inputDistanceSector))) || (isNaN(parseInt(inputDirectionSector))))  {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }     
    tableau.cmdMoveSector(inputDistanceSector,inputDirectionSector);
    nextTurn();
}

/* move tableau */
function cmdMoveTableau() {
    let inputDistanceSector = document.getElementById("inputDistanceTableau").value;
    let inputDirectionSector = document.getElementById("inputDirectionTableau").value;
    /* check if number is correct */
    if ((isNaN(parseInt(inputDistanceSector))) || (isNaN(parseInt(inputDirectionSector))))  {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }     
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
    /* check if number is correct */
    if (isNaN(parseInt(inputDirectionTorpedo))) {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }      
    tableau.cmdTorpedo(inputDirectionTorpedo);
    nextTurn();
}

/* display available command */
function displayCommand() {
    let htmlResult = "";
    htmlResult+="<table class='table text-center'>";
    htmlResult+="<thead>";
    htmlResult+="<th scope='col'>"+TEXT_CMD_NUM+"</th>";
    htmlResult+="<th scope='col'>"+TEXT_CMD_DESCR+"</th>";
    htmlResult+="</thead>";
    htmlResult+="<tbody>";
    /* cmd 1 */    
    htmlResult+="<tr>";
    htmlResult+="<td>1 &gt; 0</td>";
    htmlResult+="<td>"+TEXT_CMD1_TABLEAU+"</td>";
    htmlResult+="</tr>";
    htmlResult+="<tr>";
    htmlResult+="<td>1 &gt; 1</td>";
    htmlResult+="<td>"+TEXT_CMD1_SECTOR+"</td>";
    htmlResult+="</tr>";
    /* cmd 2 */
    htmlResult+="<tr>";
    htmlResult+="<td>2</td>";
    htmlResult+="<td>"+TEXT_CMD2+"</td>";
    htmlResult+="</tr>";
    /* cmd 3 */
    htmlResult+="<tr>";
    htmlResult+="<td>3</td>";
    htmlResult+="<td>"+TEXT_CMD3+"</td>";
    htmlResult+="</tr>";
    /* cmd 4 */
    htmlResult+="<tr>";
    htmlResult+="<td>4</td>";
    htmlResult+="<td>"+TEXT_CMD4+"</td>";
    htmlResult+="</tr>";
    /* cmd 5 */
    htmlResult+="<tr>";
    htmlResult+="<td>5</td>";
    htmlResult+="<td>"+TEXT_CMD5+"</td>";
    htmlResult+="</tr>";
    /* cmd 8 */
    htmlResult+="<tr>";
    htmlResult+="<td>8</td>";
    htmlResult+="<td>"+TEXT_CMD8+"</td>";
    htmlResult+="</tr>";
    /* cmd 9 */
    htmlResult+="<tr>";
    htmlResult+="<td>9</td>";
    htmlResult+="<td>"+TEXT_CMD9+"</td>";
    htmlResult+="</tr>";
    /* cmd 11 */
    htmlResult+="<tr>";
    htmlResult+="<td>11</td>";
    htmlResult+="<td>"+TEXT_CMD11+"</td>";
    htmlResult+="</tr>";
    /* cmd 12 */
    htmlResult+="<tr>";
    htmlResult+="<td>12</td>";
    htmlResult+="<td>"+TEXT_CMD12+"</td>";
    htmlResult+="</tr>";

    /* end of table */
    htmlResult+="</tbody>";
    htmlResult+="</table>";
    document.getElementById('probe').innerHTML=htmlResult;            
}

/* launch a duration */
function cmdDuration(cmd) {
    let nb = parseInt(cmd);
    /* check if number is correct */
    if (isNaN(nb)) {
        addMessage(TEXT_NB_ERROR);
        refreshGame();
        return;
    }      
    /* check no kipick */    
    if (tableau.getNumKipickSector()>0) {
        addMessage(TEXT_DURATION_NOT_POSSIBLE);
        return;
    }
    /* do the duration */
    for(let i=0;i<nb;i++) {
        cmdPass();
    }
}

/* **************** */
/* Start a new game */
function cmdStartGame() {
    let inputStartKipickTxt = document.getElementById("inputStartKipick").value;
    let inputStartBaseTxt = document.getElementById("inputStartBase").value;

    /* check requested parameters */
    let inputStartKipick = parseInt(inputStartKipickTxt);
    if ((inputStartKipick<0) || (inputStartKipick>MAX_KIPICK) || (isNaN(inputStartKipick))) {
        addMessage(TEXT_KIPICK_ERROR);
        refreshGame();
        return;
    }
    let inputStartBase = parseInt(inputStartBaseTxt);
    if ((inputStartBase<1) || (inputStartBase>MAX_BASE) || (isNaN(inputStartBase))) {
        addMessage(TEXT_BASE_ERROR);
        refreshGame();
        return;
    }    

    /* start the game */
    NO_KIPICK = inputStartKipick; 
    NO_BASE = inputStartBase; 
    startGame();
}

/* starting the game */
function startGame() {
    /* activate buttons */
    activeGame=true;
    document.getElementById("btnCmd1").disabled=false;
    document.getElementById("btnCmd2").disabled=false;
    document.getElementById("btnCmd3").disabled=false;
    document.getElementById("btnCmd4").disabled=false;
    document.getElementById("btnCmd5").disabled=false;
    document.getElementById("btnCmd6").disabled=false;
    document.getElementById("btnCmd7").disabled=false;
    document.getElementById("btnCmd8").disabled=false;
    /* start the game */
    tableau = new Tableau();
    message = [];
    addMessage(TEXT_WELCOME);
    refreshGame();
    resetCmd();
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

/* closing the game */
function cmdCloseGame() {
    activeGame=false;
    document.getElementById("btnCmd1").disabled=true;
    document.getElementById("btnCmd2").disabled=true;
    document.getElementById("btnCmd3").disabled=true;
    document.getElementById("btnCmd4").disabled=true;
    document.getElementById("btnCmd5").disabled=true;
    document.getElementById("btnCmd6").disabled=true;
    document.getElementById("btnCmd7").disabled=true;
    document.getElementById("btnCmd8").disabled=true;
}

/* generate a dommage for testing */
function generateDamage() {
    tableau.endurci.generateDamage(50);
    refreshGame();
}

/* use text command to control the game */
function manageTextCmd(cmd) {
    /* check if active game */
    if (!activeGame) {
        return;
    }
    /* first level command */
    const cmdInputText = document.getElementById("inputGroupCmd");   
    if (cmdLevel==0) { 
        cmdRequest = cmd;
        switch(cmd) {
            case "1":
                cmdInputText.innerText="type 0=long 1=short";
                cmdLevel++;
                break;
            case "2":
                cmdInputText.innerText="duration";
                cmdLevel++;
                break;
            case "4":
                cmdInputText.innerText="force";
                cmdLevel++;
                break;
            case "5":
                cmdInputText.innerText="direction";
                cmdLevel++;
                break;
            case "9":
                cmdInputText.innerText="pourcentage";
                cmdLevel++;
                break;
            case "3":
                cmdRadar();
                break;
            case "8":
                cmdProbe();
                break;
            case "11":
            case "?":
            case "0":
                displayCommand();
            case "12":
                endTurn();
                break;
            default:
                addMessage(cmd + " " + TEXT_COMMAND_NOT_FOUND);
                displayCommand();
                resetCmd();
        }    
    /* second level of command line */
    } else if (cmdLevel==1) {
        switch(cmdRequest) {
            case "1":
                if ((cmd=="0") || (cmd=="1")) {
                    cmdLevel2=cmd;
                    cmdLevel++;
                    cmdInputText.innerText="Distance";                
                } else resetCmd();
                break;
            case "2":
                cmdDuration(cmd);
                resetCmd();
                break;
            case "4":
                document.getElementById("inputPhaser").value = cmd;
                cmdPhaser();
                resetCmd();
                break;
            case "5":
                document.getElementById("inputTorpedo").value = cmd;
                cmdTorpedo();
                resetCmd();
                break;
            case "9":
                document.getElementById("inputShieldRate").value = cmd;
                cmdShield();
                resetCmd();
                break;
            default:
                addMessage(cmd + " " + TEXT_COMMAND_NOT_FOUND);
                resetCmd()
        } 
    /* request for move */    
    } else if (cmdLevel==2) {
        cmdInputText.innerText="Direction";
        cmdLevel3=cmd;
        cmdLevel++;
    } else if (cmdLevel==3) {
        /* check if requested the sector move */
        if (cmdLevel2=="1") {
            document.getElementById("inputDistanceSector").value = cmdLevel3;
            document.getElementById("inputDirectionSector").value = cmd;   
            cmdMoveSector();             
        } else {
            document.getElementById("inputDistanceTableau").value = cmdLevel3;
            document.getElementById("inputDirectionTableau").value = cmd;                
            cmdMoveTableau();
        }
        resetCmd();
    } else resetCmd();
}

/* reset cmd level */
function resetCmd() {
    const cmdInputText = document.getElementById("inputGroupCmd");   
    cmdInputText.innerHTML="<i class='fa-regular fa-terminal'></i>&nbsp;msg";
    cmdLevel=0;
}

/* generate a collison for testing */
function generateCollision() {
    tableau.endurci.collision(500);
    refreshGame();
}

/* ************************/
/* start game when loaded */
window.onload=function()
{
    document.getElementById('inputStartKipick').value = NO_KIPICK;
    document.getElementById('inputStartBase').value = NO_BASE;   
    startGame();
    const cmdText = document.getElementById("cmdText");    
    cmdText.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            cmd=document.getElementById("cmdText").value;
            manageTextCmd(cmd);
            document.getElementById("cmdText").value="";
            refreshGame();
        } else if (key === "Escape") {
            resetCmd();
        }
    })
    
}
