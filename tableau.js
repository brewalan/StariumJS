/* Class contenant tout le tableau */
class Tableau {
    /* array with all the objects */
    obj = [];
    discovered = [];
    endurci;
    galacticYear;
    galacticMonth; 

    constructor() {
        this.initTableau();
    }


    /* functions */
    initTableau() {
        this.generateTime();
        this.generateStar();
        this.generateBase();
        this.generateKipick();
        this.generateEndurci();
        this.generateSector(); 
        this.generateFogOfWar();    
    }

    /* Generate galactic time */
    generateTime() {
        this.galacticYear = START_YEAR + getRandomInt(25);
        this.galacticMonth = getRandomInt(10);
    }

    /* create the base. Max 1 base per sector */
    generateBase() {
        let placedBase = 0;
        while(placedBase < NO_BASE) {
            /* determine where to place base */
            let cooGX = getRandomInt(TABLEAU_MAX_X);
            let cooGY = getRandomInt(TABLEAU_MAX_Y);
            /* check unicity */
            if (this.checkBaseSector(cooGX,cooGY)) {
                let base = new Base(cooGX, cooGY);
                this.obj.push(base);
                placedBase++;
            }       
        }
    }

    /* create all stars. Max 9 per sector */
    generateStar() {
        /* browse all sectors to allocate the number of stars */
        for(let i=0;i<TABLEAU_MAX_X;i++) {
            for(let j=0;j<TABLEAU_MAX_Y;j++) {
                /* create the stars */
                let maxStar = getRandomInt(MAX_STAR_SECTOR)+1;
                if (maxStar>MAX_STAR_SECTOR) {
                    maxStar=MAX_STAR_SECTOR;
                }
                for(let k=0;k<maxStar;k++) {
                    const star = new Star(i,j);
                    this.obj.push(star);
                }
            }
        }
    }

    /* create the kipick. Max 9 per sector and no base */
    generateKipick() {
        let placedKipick = 0;
        let toBePlaced = 0;
        while(placedKipick < NO_KIPICK) {
            toBePlaced = getRandomInt(MAX_KIPICK_SECTOR)+1;
            if (toBePlaced>MAX_KIPICK_SECTOR) {
                toBePlaced=MAX_KIPICK_SECTOR;
            }
            /* determine where to place kipick */
            let cooGX = getRandomInt(TABLEAU_MAX_X);
            let cooGY = getRandomInt(TABLEAU_MAX_Y);
            /* check if not much than 9 */
            if (this.checkKipickSector(cooGX,cooGY,toBePlaced)) {
                for(let i=0 ; i<toBePlaced ; i++) {
                    /* not more than expected */
                    if (placedKipick < NO_KIPICK) {
                        let kipick = new Kipick(cooGX, cooGY);
                        this.obj.push(kipick);
                        placedKipick++;
                    }
                }
            }       
        }
    }

    /* Generate Endurci object */
    generateEndurci() {
        /* determine where to place Endurci */
        let cooGX = getRandomInt(TABLEAU_MAX_X);
        let cooGY = getRandomInt(TABLEAU_MAX_Y);
        this.endurci = new Endurci(cooGX,cooGY);
    }


    /* generate all the sectors position */
    generateSector() {
        /* browse all objects to allocate local position to objects */
        for(let i=0;i<TABLEAU_MAX_X;i++) {
            for(let j=0;j<TABLEAU_MAX_Y;j++) {
                let sectorObjects = this.getSectorObjects(i,j);
                for(const currentObject of sectorObjects) {
                    /* check if position is not yet on another object */
                    let placed = false;
                    while(!placed) {
                        /* determine where to place Endurci */
                        let cooLX = getRandomInt(SECTOR_MAX_X);
                        let cooLY = getRandomInt(SECTOR_MAX_Y);
                        
                        let findMe = false;
                        for(const tempObject of sectorObjects) {
                            if ((tempObject.localX == cooLX) && 
                                (tempObject.localY == cooLY)) {
                                    findMe=true;
                            }
                        }
                    
                        /* assign position if position is free */
                        if (!findMe) {
                            currentObject.localX = cooLX;
                            currentObject.localY = cooLY;  
                            placed = true; 
                        }
                    }                  

                }
            }
        }

    }

    /* by default, nothing is discovered except where the Endurci is */
    generateFogOfWar() {
        /* create a representative grid */
        this.discovered = new Array(TABLEAU_MAX_X);
        for (let i = 0; i < TABLEAU_MAX_X; i++) {
            this.discovered[i] = new Array(TABLEAU_MAX_Y);
            /* reset to false by default */
            for (let j = 0; j < TABLEAU_MAX_Y; j++) {
                this.discovered[i][j]=false;
            }
        }
        this.cmdRadar();
        /* first radar is free */
        this.endurci.energyCost(-ENERGY_RADAR);
    }

    /* *********************** */
    /* check placement object */
    
    /* check if base doesn't exist in the sector */
    checkBaseSector(cooGX,cooGY) {
        let findMe = false;
        /* browse all objects to be displayed in the grid */
        for(const currentObject of this.obj) {
            if (currentObject instanceof Base) {
                if ((currentObject.globalX == cooGX) && 
                    (currentObject.globalY == cooGY)) {
                        findMe = true;
                    }
                }
            }
        return !findMe;   
    }

    /* check if kipick doesn't exist in the sector */
    checkKipickSector(cooGX,cooGY, n) {
        let no = 0;
        /* browse all objects to be displayed in the grid */
        for(const currentObject of this.obj) {
            if (currentObject instanceof Kipick) {
                if ((currentObject.globalX == cooGX) && 
                    (currentObject.globalY == cooGY)) {
                    no+=n;
                }                
            } else if (currentObject instanceof Base) {
                if ((currentObject.globalX == cooGX) && 
                    (currentObject.globalY == cooGY)) {
                    no+=10;
                }
            }
        }
        return (no<=9);   
    }

    /* ************************ */
    /* browse all the objects from the tableau to display it */
    displayTableau() {
        /* create a representative grid */
        let tab = new Array(TABLEAU_MAX_X);
        for (let i = 0; i < TABLEAU_MAX_X; i++) {
           tab[i] = new Array(TABLEAU_MAX_Y);
           /* reset to 0 by default */
           for (let j = 0; j < TABLEAU_MAX_Y; j++) {
               tab[i][j]=0;
           }
        }

        /* browse all objects to be display in the grid */
        for(const currentObject of this.obj) {
            if (currentObject.isAlive()) {
                if (currentObject instanceof Star) {
                    tab[currentObject.globalX][currentObject.globalY]++;
                } else if (currentObject instanceof Base) {
                    tab[currentObject.globalX][currentObject.globalY]+=10;
                } else if (currentObject instanceof Kipick) {
                    tab[currentObject.globalX][currentObject.globalY]+=100;
                }
            }
        }

        /* display the result */
        let htmlResult = "<p>\n";
        for (let y = 0; y < TABLEAU_MAX_Y; y++) {
            for (let x = 0; x < TABLEAU_MAX_X; x++) {
                /* if Endurci is there, color the sector */
                let sectorStart = "&brvbar;";
                let sectorEnd = "";
                if ((x==this.endurci.globalX) &&
                    (y==this.endurci.globalY)) {
                        sectorStart = "&brvbar;<b>";
                        sectorEnd = "</b>";
                    } 
                /* otherwise, display what is present: XYZ : X= Kipick, Y = Base, Z = stars */
                /* check fog of war */
                if (this.discovered[x][y]) {
                    let sector = tab[x][y].toString();
                    sector = sector.padStart(3,'0')
                    htmlResult+=sectorStart+sector+sectorEnd;
                } else {
                    htmlResult+="<font style='background-color:lightgray;'>"+sectorStart+"&nbsp;&nbsp;&nbsp;"+sectorEnd+"</font>";
                }
            }
            htmlResult+="&brvbar;<br />\n"
        }
        htmlResult+="</p>";
        return htmlResult;
    }

    /* display sector */
    displaySector() {
        /* get objects from sector and display them */
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);

        /* create a representative grid */
        let tab = new Array(SECTOR_MAX_X);
        let tabFocus = new Array(SECTOR_MAX_X); 
        for (let i = 0; i < SECTOR_MAX_X; i++) {
           tab[i] = new Array(SECTOR_MAX_Y);
           tabFocus[i] = new Array(SECTOR_MAX_Y);
           /* reset to 0 by default */
           for (let j = 0; j < SECTOR_MAX_Y; j++) {
               tab[i][j]=".";
               tabFocus[i][j]=false;
           }
        }

        /* browse all objects to be displayed in the grid */
        for(const currentObject of sectorObjects) {
            if (currentObject instanceof Star) {
                tab[currentObject.localX][currentObject.localY]="*";
            } else if (currentObject instanceof Base) {
                tab[currentObject.localX][currentObject.localY]="B";
            } else if (currentObject instanceof Kipick) {
                tab[currentObject.localX][currentObject.localY]="K";
            } else if (currentObject instanceof Endurci) {
                tab[currentObject.localX][currentObject.localY]="E";
            } else if (currentObject instanceof Torpedo) {
                tab[currentObject.localX][currentObject.localY]="#";
            }
            /* check if focus must be done */
            tabFocus[currentObject.localX][currentObject.localY]=currentObject.focus;
        }

        /* display the result */
        let htmlResult = "<p>&nbsp;.&nbsp;1&nbsp;2&nbsp;3&nbsp;4&nbsp;5&nbsp;6&nbsp;7&nbsp;8&nbsp;9&nbsp;10<br />\n";
        for (let y = 0; y < SECTOR_MAX_Y; y++) {
            let line = y+1;
            let lineStr = (line != 10) ? "&nbsp;"+line.toString()+"&nbsp;" : "10&nbsp;";            
            htmlResult+=lineStr;
            for (let x = 0; x < SECTOR_MAX_X; x++) {
                /* display what is present: XYZ : X= Kipick, Y = Base, Z = stars */
                let sector = tab[x][y];
                /* display object focus */
                if (tabFocus[x][y]) {
                    sector = "<font style='background-color:red;' color='white'>"+sector+"</font>";
                }
                sector = sector + "&nbsp;";

                /* check damaged */
                if (this.endurci.isDamaged(DAMAGE_SHORT_RADAR)) {
                    let localSector = "&nbsp;&nbsp;";
                    /* check Endruci position to see local events */
                    const eX = this.endurci.localX;
                    const eY = this.endurci.localY;
                    if (((x>=eX-1) && (x<=eX+1) && (y>=eY-1) && (y<=eY+1)) || (tabFocus[x][y])) {
                        /* normal display */
                    } else {
                        /* display sector in gray */
                        sector = "<font style='background-color:lightgray;'>&nbsp;&nbsp;</font>";
                    }
                }

                htmlResult+=sector;
            }
            htmlResult+="<br />\n"
        }
        htmlResult+="</p>";
        return htmlResult;


    }

    /* Format display info */
    getDisplayInfo(txt,val) {
        let htmlResult = "<tr><td>";
        htmlResult+=txt;
        htmlResult+="</td><td class='text-end'>";
        htmlResult+=val;
        htmlResult+="</td></tr>";
        return htmlResult;
    }

    /* galactic time with year.month */
    getGalacticTime() {
        return this.galacticYear+"."+this.galacticMonth;
    }

    /* increment galacic time */
    setNextMonth() {
        this.galacticMonth++;
        if (this.galacticMonth>9) {
            this.galacticMonth=0;
            this.galacticYear++;
        }
    }

    /* display information on Endurci status */
    displayInfo() {
        let htmlResult = "<table>";
        htmlResult+=this.getDisplayInfo(TEXT_GALACTIC_YEAR,this.getGalacticTime());
        htmlResult+=this.getDisplayInfo(TEXT_COO_GLOBALE,this.getCoo(this.endurci.globalX,this.endurci.globalY));
        htmlResult+=this.getDisplayInfo(TEXT_COO_LOCALE,this.getCoo(this.endurci.localX,this.endurci.localY));
        htmlResult+=this.getDisplayInfo(TEXT_ALERT,this.getAlertLevel());
        htmlResult+=this.getDisplayInfo(TEXT_SHIELD_RATE,this.endurci.shieldRate+"%");
        htmlResult+=this.getDisplayInfo(TEXT_SHIELD_ENERGY,this.endurci.shield);
        htmlResult+=this.getDisplayInfo(TEXT_ENERGY,this.endurci.energy);
        htmlResult+=this.getDisplayInfo(TEXT_TORPEDOES,this.endurci.torpedo + " / "+ENDURCI_TORPEDO);
        htmlResult+=this.getDisplayInfo(TEXT_REMAINING_BASE,this.getNumBase() + " / "+NO_BASE);
        htmlResult+=this.getDisplayInfo(TEXT_REMAINING_KIPICK,this.getNumKipick() + " / "+NO_KIPICK);
        htmlResult+="</table>";
        return htmlResult;
    }

    /* format the damage info */
    getDamageInfo(txt,d) {
        let htmlResult="<tr><td>"+txt+"</td><td>";
        let damage = this.endurci.damage[d];
        if (damage==0) {
            htmlResult+="OK";
        } else {
            htmlResult+="<font color='red'>"+damage;
            htmlResult+=(damage>1) ? " "+TEXT_UNITIES : " "+TEXT_UNITY;
            htmlResult+="</font>";
        }
        htmlResult+="</td></tr>";
        return htmlResult;
    }

    /* display damage info */
    displayDamageInfo() {
        let htmlResult = "<table>";
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_ENGINE,DAMAGE_ENGINE);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_LONG_RADAR,DAMAGE_LONG_RADAR);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_SHORT_RADAR,DAMAGE_SHORT_RADAR);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_PHASER,DAMAGE_PHASER);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_TORPEDO,DAMAGE_TORPEDO);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_PROBE,DAMAGE_PROBE);
        htmlResult+=this.getDamageInfo(TEXT_DAMAGE_CRYSTAL+"&nbsp;",DAMAGE_CRYSTAL);
        htmlResult+="</table>";
        return htmlResult;
    }

    /* ************************ */
    /* return number of existing base */
    getNumBase() {
        let numBase = 0;
        /* browse all objects to be displayed in the grid */
        for(const currentObject of this.obj) {
            if (currentObject instanceof Base) {
                if (currentObject.isAlive()) {
                    numBase++;
                }
            }
        }
        return numBase;   
        
    }

    /* number of existing kipick */
    getNumKipick() {
        let numKipick = 0;
        /* browse all objects to be displayed in the grid */
        for(const currentObject of this.obj) {
            if (currentObject instanceof Kipick) {
                if (currentObject.isAlive()) {
                    numKipick++;
                }
            }
        }
        return numKipick;   
        
    }

    /* number of Kipick in the current sector */
    getNumKipickSector() {
        /* get objects from sector and display them */
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);

        let numKipick = 0;
        /* browse all objects to be displayed in the grid */
        for(const currentObject of sectorObjects) {
            if (currentObject instanceof Kipick) {
                if (currentObject.isAlive()) {
                    numKipick++;
                }
            }
        }
        return numKipick;   
            
    }

    /* display alert level */
    getAlertLevel() {
        let alert = "<font color='green'>"+TEXT_ALERT_GREEN+"</font>";
        let energyTotal = this.endurci.energy + this.endurci.shield;
        if (this.getNumKipickSector()>0) {
            if (energyTotal < 1000) {
                alert = "<font color='purple'>"+TEXT_ALERT_CRITICAL+"</font>";
            } else {
                alert = "<font color='red'>"+TEXT_ALERT_RED+"</font>"; 
            }        
        } else {
            if (energyTotal < 1000) {
                alert = "<font color='orange'>"+TEXT_ALERT_YELLOW+"</font>";
            }  
        }

        return alert;
    }

    /* return all the objects present in a sector */
    getSectorObjects(x,y) {
        let sectorObjects = [];
        /* browse all objects to be displayed in the grid */
        for(const currentObject of this.obj) {
            if ((currentObject.globalX == x) && 
                (currentObject.globalY == y) && 
                (currentObject.isAlive())) {
                sectorObjects.push(currentObject);
            }
        }   
        //check Endurci
        if ((this.endurci.globalX == x) && (this.endurci.globalY == y)) {
            sectorObjects.push(this.endurci);
        }        
        return sectorObjects;     
    }

    /* ************************* */
    /* manage coordinates */

    /* transform coordintates to remove 0 */
    getCoo(x,y) {
        let xx = x+1;
        let yy = y+1;
        return xx+" / "+yy;
    }
    
    /* check if not outside of borders */
    getGlobalCooX(x) {
        while((x<0) || (x>=TABLEAU_MAX_X)) {
            if (x<0) {
                x+=TABLEAU_MAX_X;
            }
            if (x>=TABLEAU_MAX_X) {
                x-=TABLEAU_MAX_X;
            }
        }
        return x;
    }

    /* check if not outside of borders */
    getGlobalCooY(y) {
        while((y<0) || (y>=TABLEAU_MAX_Y)) {
            if (y<0) {
                y+=TABLEAU_MAX_Y;
            }
            if (y>=TABLEAU_MAX_Y) {
                y-=TABLEAU_MAX_Y;
            }
        }
        return y;
    }

    /* move object inside tableau */
    moveTableau(obj,posX,posY) {
        /* movement for X */
        obj.globalX+=posX;
        if (obj.globalX<0) {
            obj.globalX+=TABLEAU_MAX_X;
        } 
        if (obj.globalX>=TABLEAU_MAX_X) {
            obj.globalX-=TABLEAU_MAX_X;
        }
        /* movement for Y */
        obj.globalY+=posY;
        if (obj.globalY<0) {
            obj.globalY+=TABLEAU_MAX_Y;
        } 
        if (obj.globalY>=TABLEAU_MAX_Y) {
            obj.globalY-=TABLEAU_MAX_Y;
        }      
        /* discover fog of war in case Endurci was moving */
        this.discovered[this.endurci.globalX][this.endurci.globalY]=true;  
    }

    /* check if sector is occupied */
    checkCollision(source,posX,posY) {
        /* check if source has moved */
        if ((source.localX==posX) && (source.localY==posY)) {
            return false;
        }
        /* if yes, check collision */
        let collision = false;
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
        for(const currentObject of sectorObjects) {
            if ((currentObject.localX==posX) && (currentObject.localY==posY)) {
                collision = true;
            }
        }
        return collision;
    }

    /* get object with collision */
    getCollisionObject(posX,posY) {
        let obj;
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
        for(const currentObject of sectorObjects) {
            if ((currentObject.localX==posX) && (currentObject.localY==posY)) {
                obj = currentObject;
            }
        }
        return obj;
    }

    /* manage energy for all objects */
    endTurnEnergy() {
        /* browse all objects to be display in the grid */
        for(const currentObject of this.obj) {
            if (currentObject.isActive()) {
                currentObject.endTurnEnergy();
            }
        }
        /* same for Endurci */
        this.endurci.endTurnEnergy();
    }
 
    /* ************************* */
    /* Kipick turn */
    /* determine if some Kipicks must play */
    isKipickTurn() {
        /* get objects from sector and display them */
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);

        let numKipick = 0;
        /* browse all objects to check if some Kipicks must play */
        for(const currentObject of sectorObjects) {
            if (currentObject instanceof Kipick) {
                if (currentObject.isAlive()) {
                    if (!currentObject.playTurn) {
                        numKipick++;
                    }
                }
            }
        }
        return (numKipick>0);               
    }

    /* Kipick to play */
    playNextKipick() {
        /* get objects from sector and display them */
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
        /* browse all objects to start playing the next Kipick */
        for(const currentObject of sectorObjects) {
            if (currentObject instanceof Kipick) {
                if (currentObject.isAlive()) {
                    if (!currentObject.playTurn) {
                        currentObject.play();
                        return;
                    }
                }
            }
        }        
    }

    /* all object to play turn */
    resetPlayTurn() {
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
        for(const currentObject of sectorObjects) {
            currentObject.playTurn=false;
        }
    }

    /* repair the different objects if needed */
    repair() {
        for(const currentObject of this.obj) {
            currentObject.repair();
        }    
        this.endurci.repair();    
    }

    /* ************************* */
    /* generate command */

    /* radar command to discover tableau */
    cmdRadar() {
        /* check damage */
        if (this.endurci.isDamaged(DAMAGE_LONG_RADAR)) {
            this.endurci.generateDamageMessage(DAMAGE_LONG_RADAR);
            return;
        }

        /* discover around */
        for(let x=this.endurci.globalX-1;x<=this.endurci.globalX+1;x++) {
            for(let y=this.endurci.globalY-1;y<=this.endurci.globalY+1;y++) {
                this.discovered[this.getGlobalCooX(x)][this.getGlobalCooY(y)] = true;                
            }
        }
         /* cost of energy */   
        this.endurci.energyCost(ENERGY_RADAR); 
    }

    /* probe to display Kipicks information */
    cmdProbe() {
        /* check damage */
        if (this.endurci.isDamaged(DAMAGE_PROBE)) {
            this.endurci.generateDamageMessage(DAMAGE_PROBE);
            return "";
        }  
        
        /* display result */
        let defaultTxt = "<h5>"+TEXT_PROBE+this.getGalacticTime()+"</h5>";
        let htmlResult = defaultTxt;
        let numKipick = 0;
        /* get objects from sector and display them */
        let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
        /* browse all objects to be displayed in the grid */
        htmlResult+="<table class='table text-center'>";
        htmlResult+="<thead>";
        htmlResult+="<th scope='col'>"+TEXT_TYPE+"</th>";
        htmlResult+="<th scope='col'>"+TEXT_COO_LOCALE+"</th>";
        htmlResult+="<th scope='col'>"+TEXT_SHIELD_ENERGY+"</th>";
        htmlResult+="<th scope='col'>"+TEXT_ENERGY+"</th>";
        htmlResult+="<th scope='col'>"+TEXT_TORPEDO+"</th>";
        htmlResult+="</thead>";
        htmlResult+="<tbody>";
        for(const currentObject of sectorObjects) {
            if (currentObject instanceof Kipick) {
                if (currentObject.isAlive()) {
                    htmlResult+="<tr>";
                    htmlResult+="<td>Kipick</td>";
                    htmlResult+="<td>"+this.getCoo(currentObject.localX,currentObject.localY)+"</td>";
                    htmlResult+="<td>"+currentObject.shield+"</td>";
                    htmlResult+="<td>"+currentObject.energy+"</td>";
                    htmlResult+="<td>"+currentObject.torpedo+"</td>";
                    htmlResult+="</tr>";
                    numKipick++;
                }
            }
        }  
        htmlResult+="</tbody>";
        htmlResult+="</table>";
        /* check if there is some kipicks in the sector */
        if (numKipick==0) {
            htmlResult=defaultTxt;
            htmlResult+="<p>"+TEXT_NO_KIPICK+"</p>";            
        } else {     
            /* cost of energy */   
            this.endurci.energyCost(ENERGY_PROBE); 
        }

        return htmlResult;
    }

    /* change shield rate */
    cmdShield(shieldRateTxt) {
        let shieldRate = parseInt(shieldRateTxt);
        if ((shieldRate >= 1) && (shieldRate <= 99)) {
            let messageRequest = (shieldRate != this.endurci.shieldRate)
            this.endurci.shieldRate = shieldRate;
            if (messageRequest) {
                addMessage(TEXT_SHIELD_CHANGE+this.endurci.shieldRate+"%");
            }
        } else {
            addMessage(TEXT_SHIELD_ERROR);
        }
    }

    /* run laser command */
    cmdPhaser(phaserTxt) {
        /* check damage */
        if (this.endurci.isDamaged(DAMAGE_PHASER)) {
            this.endurci.generateDamageMessage(DAMAGE_PHASER);
            return;
        } 
        
        /* check if Kipick are present */
        if (this.getNumKipickSector()==0) {
            addMessage(TEXT_NO_KIPICK);
            return;
        }

        /* check power requested */
        let phaserRate = parseInt(phaserTxt);
        if ((phaserRate >= 1) && (phaserRate <= this.endurci.energy-200)) {
            /* browse all Kipicks to send them a phaser */
            let sectorObjects = this.getSectorObjects(this.endurci.globalX,this.endurci.globalY);
            for(const currentObject of sectorObjects) {
                if (currentObject instanceof Kipick) {
                    if (currentObject.isAlive()) {
                        /* determine the amount of energy received by the Kipick */
                        let distanceX = Math.abs(this.endurci.localX - currentObject.localX);
                        let distanceY = Math.abs(this.endurci.localY - currentObject.localY);
                        let phaserDistance = Math.sqrt(Math.pow(distanceX,2)+Math.pow(distanceY,2));
                        let phaserPower=Math.ceil(phaserRate*PHASER_MULTIPLICOR/phaserDistance);
                        if (phaserPower>currentObject.shield) {
                            phaserPower*=3;
                        }
                        /* launch phaser action */
                        let actionType = new ActionType();
                        actionType.addPhaser(this.endurci,currentObject,phaserPower);
                        addAction(actionType);
                    }
                }
            }
        } else {
            addMessage(TEXT_ENERGY_ERROR);
        }

        /* energy cost */
        this.endurci.energyCost(phaserRate);
        
    }

    /* run a move in the same sector */
    cmdMoveSector(inputDistanceSectorTxt,inputDirectionSectorTxt) {
        /* check requested parameters */
        let inputDistanceSector = parseInt(inputDistanceSectorTxt);
        if ((inputDistanceSector<1) || (inputDistanceSector>12)) {
            addMessage(TEXT_DISTANCE_ERROR);
            return;
        }
        let inputDirectionSector = parseInt(inputDirectionSectorTxt);
        if ((inputDirectionSector<0) || (inputDirectionSector>360)) {
            addMessage(TEXT_DIRECTION_ERROR);
            return;
        }

        /* Management movement */
        let energyRequested = ENERGY_MOVEMENT_SECTOR * inputDistanceSector;
        if (energyRequested<this.endurci.energy) {
            let actionType = new ActionType();
            actionType.addMovementSector(this.endurci,inputDistanceSector,inputDirectionSector);
            addAction(actionType);
        } else {
            addMessage(TEXT_ENERGY_ERROR);
        }
        
    }


    /* run a move in the tableau */
    cmdMoveTableau(inputDistanceTableauTxt,inputDirectionTableauTxt) {
        /* check damage */
        if (this.endurci.isDamaged(DAMAGE_ENGINE)) {
            this.endurci.generateDamageMessage(DAMAGE_ENGINE);
            return;
        } 

        /* check requested parameters */
        let inputDistanceTableau = parseInt(inputDistanceTableauTxt);
        if ((inputDistanceTableau<1) || (inputDistanceTableau>12)) {
            addMessage(TEXT_DISTANCE_ERROR);
            return;
        }
        let inputDirectionTableau = parseInt(inputDirectionTableauTxt);
        if ((inputDirectionTableau<0) || (inputDirectionTableau>360)) {
            addMessage(TEXT_DIRECTION_ERROR);
            return;
        }

        /* Management movement */
        let energyRequested = ENERGY_MOVEMENT_TABLEAU * inputDistanceTableau;
        if (energyRequested<this.endurci.energy) {
            let actionType = new ActionType();
            actionType.addMovementTableau(this.endurci,inputDistanceTableau,inputDirectionTableau);
            addAction(actionType);
        } else {
            addMessage(TEXT_ENERGY_ERROR);
        }
        
    }   
    
    /* launch a torpedo */
    cmdTorpedo(inputDirectionTorpedoTxt) {
        /* check damage */
        if (this.endurci.isDamaged(DAMAGE_TORPEDO)) {
            this.endurci.generateDamageMessage(DAMAGE_TORPEDO);
            return;
        } 

        /* check requested parameters */
        let inputDirectionTorpedo = parseInt(inputDirectionTorpedoTxt);
        if ((inputDirectionTorpedo<0) || (inputDirectionTorpedo>360)) {
            addMessage(TEXT_DIRECTION_ERROR);
            return;
        }

        /* check number of remaining Torpedo */
        if (this.endurci.torpedo<=0) {
            addMessage(TEXT_NO_TORPEDO_LEFT);            
            return;
        }
        this.endurci.torpedo--;

        /* Management movement */
        let actionType = new ActionType();
        let torpedo = new Torpedo();
        torpedo.globalX = this.endurci.globalX;
        torpedo.globalY = this.endurci.globalY;
        torpedo.localX = this.endurci.localX;
        torpedo.localY = this.endurci.localY;
        this.obj.push(torpedo);
        actionType.addMovementSector(torpedo,20,inputDirectionTorpedo);
        addAction(actionType);
        
    }      




}