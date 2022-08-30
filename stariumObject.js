class StariumObject {
    /* Constructeur de l'objet */ 
    constructor(x,y) {
        this.globalX = x;
        this.globalY = y;
        //no damage by default
        this.damage=new Array(DAMAGE_MAX);
        for(let i=0;i<DAMAGE_MAX;i++) {
            this.damage[i]=0;
        }
    }

    /* position on sector */
    localX=-1;
    localY=-1;
    /* position on tableau */
    globalX=0;
    globalY=0;
    /* energy for the object */
    energy=0;
    /* energy shield for the object */
    shield=0;
    /* shield rate in percentage */
    shieldRate=50;
    /* energy that can't overloaded */
    energyMax=0;
    /* energy that can be produced by turn */
    energyRateTurn=0;
    /* energy that can be transferred by turn */
    energyTransfer=0;
    /* number of torpedo */
    torpedo=0;
    /* object status */
    status = ObjectStatus.active;
    /* damage on the object */
    damage = [];
    /* variable used when it is object turn */
    focus=false;
    /* determine if a message must be produced, message should only be produced for Endurci */
    generateMessage=false;
    /* determine if the turn needs to be played */
    playTurn = false;

    /* give name of object, sector position by default */
    getName() {
        let xx = this.localX + 1;
        let yy = this.localY + 1;
        return " "+xx+"/"+yy;
    }

    /* energy cost, reduce amount of energy and check if still alive */
    energyCost(cost) {
        this.energy -= cost;
        if (this.energy < 0) {
            this.status = ObjectStatus.destroyed;
        }
    }

    /* energy cost for shield. If not enough energy, damage */
    collision(cost) {
        if (this.shield>cost) {
            /* case shield is enough */
            this.shield -= cost;
        } else if (this.shield>cost/3) {
            /* case shield is present but not enough */
            this.shield -= cost;
            let overEnergy = -this.shield;
            this.shield = 0;
            this.energyCost(overEnergy / 2);
            this.generateDamage(overEnergy / 2);
        } else {
            /* case no shield */
            this.shield = 0;
            this.energyCost(cost);
            this.generateDamage(cost / 2);
        }
    }

    /* generate damage message */
    generateDamageMessage(dam) {
        let msg = TEXT_FONCTION[dam];
        msg += " ";
        msg += TEXT_DAMAGED;
        msg += " ";
        msg += this.damage[dam];
        msg += " ";
        msg += (this.damage[dam]>1) ? TEXT_UNITIES : TEXT_UNITY;
        addMessage(msg);
    }

    /* generate a damage */
    generateDamage(cost) {
        let dam = getRandomInt(DAMAGE_MAX);
        let val = getRandomInt(cost/3);
        this.damage[dam]+=val;
        /* generate message */
        if (this.generateMessage) {
            this.generateDamageMessage(dam);
        }
    }

    /* check if damaged */
    isDamaged(val) {
        return (this.damage[val]>0);
    }

    /* say if object is alive */
    isAlive() {
        return (this.status != ObjectStatus.destroyed);
    }

    /* say if object can play turn */
    isActive() {
        return (this.status == ObjectStatus.active);
    }

    /* manage energy after turn */
    endTurnEnergy() {
        /* give extra energy if Crystal is not broken */
        if (!this.damage[DAMAGE_CRYSTAL]) {   
            let possibleEnergyMax = Math.round(this.energy*(100+this.energyRateTurn)/100); 
            if (possibleEnergyMax+this.shield>this.energyMax) {
                possibleEnergyMax = this.energyMax-this.shield;
            }
            this.energy=possibleEnergyMax;
        }
        /* share energy between shield and other */
        let energyShieldDelta = Math.round((this.energy+this.shield)*this.shieldRate/100)-this.shield;
        /* no energy transfer needed */
        if (energyShieldDelta==0) {
            return;
        }
        /* determine how much to transfer */
        let sign = (energyShieldDelta>0) ? 1 : -1;
        let energyTransfer = (Math.abs(energyShieldDelta)>this.energyTransfer) ? Math.round(this.energyTransfer*2/3+getRandomInt(this.energyTransfer/2)) : Math.abs(energyShieldDelta); 
        this.energy-=sign*energyTransfer;
        this.shield+=sign*energyTransfer;
    }
}

/* Class to manage a star */
class Star extends StariumObject {
    constructor(x,y) {
        super(x,y);
        this.status = ObjectStatus.frozen;
    }

    getName() {
        return TEXT_STAR+super.getName();
    }
}


/* class to manage a base */
class Base extends StariumObject {
    constructor(x,y) {
        super(x,y);
        this.status = ObjectStatus.frozen;
    }

    getName() {
        return TEXT_BASE+super.getName();
    }

}

/* class to manage a kipick */
class Kipick extends StariumObject {
    constructor(x,y) {
        super(x,y);
        this.energy = KIPICK_ENERGY+getRandomInt(KIPICK_VARIATION)-KIPICK_VARIATION/2;
        this.shield = KIPICK_SHIELD+getRandomInt(KIPICK_VARIATION)-KIPICK_VARIATION/2;
        this.torpedo = KIPICK_TORPEDO;
        this.energyMax = KIPICK_ENERGY_MAX;
        this.energyRateTurn = KIPICK_ENERGY_END_TURN_RATE;
        this.energyTransfer = KIPICK_ENERGY_TRANSFER;
    }

    getName() {
        return TEXT_KIPICK+super.getName();
    }

    /* Kipick turn to play */
    /* 4 actions by default: phaser, torpedo, move, nothing */
    play() {
        let action = getRandomInt(4);
        switch (action) {
            case 0:
                /* send Phaser */
                this.sendPhaser();
                break;
            case 1:
                /* move Kipick */
                this.moveSector();
                break;
            case 2:
                /* send Torpedo */
                this.sendTorpedo();
                break;
            default:
                /* do nothing */
                break; 
        }
        /* turn is played */
        this.playTurn=true;
    }

    /* Kipick to send a Torpedo if possible */
    sendTorpedo() {
        /* check if not damaged */
        if (this.isDamaged(DAMAGE_TORPEDO)) {
            return;
        }
        /* check if remaining torpedo */
        if (this.torpedo<=0) {
            return;
        }
        /* determine direction for Torpedo */        
        let direction = getRandomInt(360);
        this.torpedo--;
        /* Management movement */
        let actionType = new ActionType();
        let torpedo = new Torpedo();
        torpedo.globalX = this.globalX;
        torpedo.globalY = this.globalY;
        torpedo.localX = this.localX;
        torpedo.localY = this.localY;
        tableau.obj.push(torpedo);
        actionType.addMovementSector(torpedo,20,direction);
        addAction(actionType);     
        /* action message */
        addMessage(this.getName()+" "+TEXT_SEND_TORPEDO);
    }

    /* Kipick send Phaser */
    sendPhaser() {
        /* check if not damaged */
        if (this.isDamaged(DAMAGE_PHASER)) {
            return;
        }
        /* determine amount of energy */
        let phaserPower = getRandomInt(this.energy);
        this.energy-=phaserPower;
        /* launch phaser action */
        let actionType = new ActionType();
        actionType.addPhaser(this,tableau.endurci,phaserPower);
        addAction(actionType);    
        /* action message */
        addMessage(this.getName()+" "+TEXT_SEND_PHASER);            
    }

    /* Kipick Move sector */
    moveSector() {
        /* determine direction */
        let inputDistanceSector = 1;
        let inputDirectionSector = getRandomInt(360);
        /* Management movement */
        let energyRequested = ENERGY_MOVEMENT_SECTOR * inputDistanceSector;
        if (energyRequested<this.energy) {
            let actionType = new ActionType();
            actionType.addMovementSector(this,inputDistanceSector,inputDirectionSector);
            addAction(actionType);
        }
        /* action message */
        addMessage(this.getName()+" "+TEXT_KIPICK_MOVE);
    }

}

/* Class to manage a Torpedo */
class Torpedo extends StariumObject {
    constructor(x,y) {
        super(x,y);
        this.energy = 20*ENERGY_MOVEMENT_SECTOR;
    }

    getName() {
        return TEXT_TORPEDO+super.getName();
    }
}

/* class to manage Endurci  */
class Endurci extends StariumObject {
    constructor(x,y) {
        super(x,y);
        this.energy = ENDURCI_ENERGY;
        this.shield = ENDURCI_SHIELD;
        this.torpedo = ENDURCI_TORPEDO;
        this.shieldRate = 50;
        this.generateMessage=true;
        this.energyMax = ENDURCI_ENERGY_MAX;
        this.energyRateTurn = ENDURCI_ENERGY_END_TURN_RATE;
        this.energyTransfer = ENDURCI_ENERGY_TRANSFER;
    }

    getName() {
        return TEXT_ENDURCI+super.getName();
    }

    /* give energy from the base with the shield rate */
    takeBase() {
        this.energy = Math.round((ENDURCI_ENERGY+ENDURCI_SHIELD)*(100-this.shieldRate)/100);
        this.shield = Math.round((ENDURCI_ENERGY+ENDURCI_SHIELD)*this.shieldRate/100);
        this.torpedo = ENDURCI_TORPEDO;        
    }


}
