"use strict";
document.onkeydown = checkDown;
document.onkeyup = checkUp;



let lastUpdate = Date.now();
let dt = 0;
var touchVar = null;


// Design data 
const MaxForceInAnyDirection = 500;
const gravity = -200;
const upArrowPushForce = 500;

const gapBetweenObstacles = 150;
const distanceBetweenObstacles = 100;
const obstacleMovementSpeed = 100;

const totalTime = 120; // seconds

// Main Applicaiton 
function startGame() 
{
    MyApplicationInstance.Initialize();

    renderer.InitializeGraphics( MyApplicationInstance.GameWidth(), MyApplicationInstance.GameHeight() );
    renderer.ClearScreen();

    //renderer.canvas.addEventListener('click', OnMouseClicked,  false);
    renderer.canvas.addEventListener('mousedown', OnMouseDown,  false);
    renderer.canvas.addEventListener('mouseup', OnMouseUp,  false);

    InitUI( renderer );

    MyApplicationInstance.Start();
}

var MyApplicationInstance = 
{
    gameWidth : 500,
    gameHeight : 300,

    currentTime : 0,

    GameWidth : function() { return this.gameWidth; },
    GameHeight : function() { return this.gameHeight; },

    StateManager : new StateManager(),

    Initialize: function ( )
    {
        this.frameNumber = 0;
        lastUpdate = Date.now();
        
        this.interval = setInterval(UpdateGameLoop, 0 );
    },
    Start : function () 
    {
        this.StateManager.PushState( new StartMenuState() );
    },
    Restart: function () 
    {
            
        this.StateManager.ClearAll();
        this.StateManager.PushState( new InGameState() );
    }
}
var renderer = 
{
    canvas : null,
    context : null, 
    InitializeGraphics : function( width, height ) 
    {
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    },
    ClearScreen : function() 
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    RenderBox : function( box, point = null )
    {
        this.context.fillStyle = box.color;
        if ( this.InvertYEnabled() )
        {
            this.context.fillRect(box.x - box.w/2, this.Height() - ( box.y + box.h/2 ) , box.w, box.h);
        }
        else
            this.context.fillRect(box.x - box.w/2, box.y - box.h/2, box.w, box.h);
    },
    RenderBox : function( box, point = null )
    {
        this.context.fillStyle = box.color;
        if ( this.InvertYEnabled() )
        {
            this.context.fillRect(box.x - box.w/2, this.Height() - ( box.y + box.h/2 ) , box.w, box.h);
        }
        else
            this.context.fillRect(box.x - box.w/2, box.y - box.h/2, box.w, box.h);
    },
    RenderButton : function ( button )
    {
        if ( button.isPressed )
            this.context.fillStyle = button.selectedColor;
        else    
            this.context.fillStyle = button.color;

        if ( this.InvertYEnabled() )
        {
            this.context.fillRect(button.x - button.w/2, this.Height() - ( button.y + button.h/2 ) , button.w, button.h);
        }
        else
            this.context.fillRect(button.x - button.w/2, button.y + button.h/2, button.w, button.h);

        this.context.fillStyle = button.fontColor;
        this.context.font = button.fontType;

        if ( this.InvertYEnabled() )
        {
            this.context.fillText( button.text, button.x, this.Height() - (button.y - button.fontHeightInPX/2) );
        }
        else
            this.context.fillText( button.text, button.x, (button.y - button.fontHeightInPX/2));

        this.context.textAlign="center"; 
    },
    Width : function () { return this.canvas.width; },
    Height : function () { return this.canvas.height; },

    InvertYEnabled : function () { return true; }
}

// Application Update loop 
function UpdateGameLoop()
{
    var now = Date.now();
    dt = now - lastUpdate;
    lastUpdate = now;

    this.renderer.ClearScreen();
    OnKeyPress(touchVar);

    if ( MyApplicationInstance.StateManager != null )
        MyApplicationInstance.StateManager.Update();
};


// Main Menu 

function StartMenuState ()
{
    this.Start = function() 
    {
        this.ui = new UI();
        this.ui.Init ( true );

        this.startButton = this.ui.CreateButton ();
        this.startButton.Init ( MyApplicationInstance.GameWidth()/2, 
                                MyApplicationInstance.GameHeight()/2 , 
                                200, 50,

                                "30px Verdana", "start",
                                "white", 15,

                                "green", "red", "purple", 

                                function() 
                                { 
                                    //alert("On Start clicked"); 
                                    MyApplicationInstance.StateManager.PushState ( new InGameState() );
                                },

                                true );
    }
    this.End = function () 
    {
        
    }
    this.Update = function ()
    {
        this.ui.Render();
    }

    this.OnMouseDown = function( x, y )
    {
        this.ui.OnMouseDown ( x, y );
    }
    this.OnMouseUp = function( x, y )
    {
        this.ui.OnMouseUp ( x, y );
    }
    this.OnKeyPress = function ( keyCode )
    {
    }

    this.ui = null;
    this.startButton = null;
}


// In - Game 
function InGameState ()
{
    this.protogonistBox;
    this.obstacles = []

    this.ui = null;
    this.scoreTxt = null;
    this.retryButton = null;
    this.gameOver = false;
    this.score = 0;

    this.Start = function() 
    {
        this.protogonistBox = CreateABox();
        this.protogonistBox.SetAll ( 20, 250, 30, 30, "red", false );

        // Creating UI
        {
            this.ui = new UI();
            this.ui.Init ( true );

            this.scoreTxt = this.ui.CreateButton ();
            this.scoreTxt.Init ( MyApplicationInstance.GameWidth() -40, 
                                    MyApplicationInstance.GameHeight() - 15 , 
                                    80, 30,

                                    "15px Verdana", "score : 0",
                                    "white", 10,

                                    "green", "green", "green", 

                                    function() 
                                    { 
                                        //no action here. this is intentional
                                    },

                                    true );


            this.retryButton = this.ui.CreateButton ();
            this.retryButton.Init ( MyApplicationInstance.GameWidth()/2, 
                                    MyApplicationInstance.GameHeight()/2 , 
                                    200, 50,
    
                                    "30px Verdana", "retry",
                                    "white", 15,
    
                                    "green", "red", "purple", 
    
                                    function() 
                                    { 
                                        //alert("On Start clicked"); 
                                        MyApplicationInstance.Restart();
                                    },
    
                                    false );
        }

    }
    this.End = function () 
    {

    }
    this.Update = function ()
    {
        // update 
        if ( !this.gameOver )
        {
            // protogonist
            {
                let box = this.protogonistBox;
                if ( box.IsAffectedByGravity() )
                {
                    box.IncreaseForce ( gravity * dt/1000 );
                    if ( box.y > 0 && box.y < MyApplicationInstance.GameHeight() )
                    {
                        box.SetY( box.y + box.force * dt/1000 );
                    }
                    
                }
            }

            for( let i = 0; i < this.obstacles.length; i++ )
            {
                this.obstacles[i].Move ( dt/1000 );
            }

            if ( this.DidIJustLose() )
            {
                this.OnLostEvent();
            }
        }

        // render 
        {
            renderer.RenderBox ( this.protogonistBox );
            for( let i = 0; i < this.obstacles.length; i++ )
            {
                renderer.RenderBox ( this.obstacles[i].aboveObstacle );
                renderer.RenderBox ( this.obstacles[i].belowObstacle );
            }
        }


        
        // Create more obstacles if needed
        {
            let doINeedMoreObstacles = false;
            let positionX = 0;
            
            if ( this.obstacles.length == 0 )
            {
                doINeedMoreObstacles = true;
                positionX = MyApplicationInstance.GameWidth() + 20/* buffer*/;
            }

            if ( !doINeedMoreObstacles && this.obstacles.length > 0 )
            {
                if ( ( MyApplicationInstance.GameWidth() - this.obstacles[this.obstacles.length - 1].aboveObstacle.x ) > 
                    distanceBetweenObstacles )
                {
                    doINeedMoreObstacles = true;
                    positionX = this.obstacles[this.obstacles.length - 1].aboveObstacle.x + 
                                    distanceBetweenObstacles + 20 /* buffer */;
                }
            }
            if ( doINeedMoreObstacles ) 
            {
                this.CreateAnObstacle ( positionX, gapBetweenObstacles );
                this.score ++;
            }
        }

        // destroy obstacles which have gone out 
        {
            for( let i = 0; i < this.obstacles.length; i++ )
            {
                if ( ( this.obstacles[i].aboveObstacle.x + 20 /*buffer*/ ) < 0 )
                {
                    this.DestroyAnObstacle ( this.obstacles[i]);
                    break;  
                }
            }
            //console.log ( "Obstacle count: " + obstacles.length );
        }

        this.scoreTxt.SetText( "score : " + this.score);
        this.ui.Render();
    }

    this.DidIJustLose = function () 
    {
        if ( this.protogonistBox.y <= 0 || this.protogonistBox.y >= MyApplicationInstance.GameHeight() )
        {
            return true;
        }

        // Todo : need to optimize this further.
        for( let i = 0; i < this.obstacles.length; i++ )
        {
            // left - bottom
            if ( IsInside ( this.protogonistBox.x - this.protogonistBox.w/2, this.protogonistBox.y - this.protogonistBox.h/2,  
                            this.obstacles[i].aboveObstacle.x, this.obstacles[i].aboveObstacle.y, this.obstacles[i].aboveObstacle.w, this.obstacles[i].aboveObstacle.h  ) )
                return true;

            if ( IsInside ( this.protogonistBox.x - this.protogonistBox.w/2, this.protogonistBox.y - this.protogonistBox.h/2,  
                            this.obstacles[i].belowObstacle.x, this.obstacles[i].belowObstacle.y, this.obstacles[i].belowObstacle.w, this.obstacles[i].belowObstacle.h  ) )
                return true;

            // //- left - top
            if ( IsInside ( this.protogonistBox.x - this.protogonistBox.w/2, this.protogonistBox.y + this.protogonistBox.h/2,  
                this.obstacles[i].aboveObstacle.x, this.obstacles[i].aboveObstacle.y, this.obstacles[i].aboveObstacle.w, this.obstacles[i].aboveObstacle.h  ) )
                return true;

            if ( IsInside ( this.protogonistBox.x - this.protogonistBox.w/2, this.protogonistBox.y + this.protogonistBox.h/2,  
                            this.obstacles[i].belowObstacle.x, this.obstacles[i].belowObstacle.y, this.obstacles[i].belowObstacle.w, this.obstacles[i].belowObstacle.h  ) )
                return true;

            // //right - bottom
            if ( IsInside ( this.protogonistBox.x + this.protogonistBox.w/2, this.protogonistBox.y - this.protogonistBox.h/2,  
                this.obstacles[i].aboveObstacle.x, this.obstacles[i].aboveObstacle.y, this.obstacles[i].aboveObstacle.w, this.obstacles[i].aboveObstacle.h  ) )
                return true;

            if ( IsInside ( this.protogonistBox.x + this.protogonistBox.w/2, this.protogonistBox.y - this.protogonistBox.h/2,  
                            this.obstacles[i].belowObstacle.x, this.obstacles[i].belowObstacle.y, this.obstacles[i].belowObstacle.w, this.obstacles[i].belowObstacle.h  ) )
                return true;


            // //right - top
            if ( IsInside ( this.protogonistBox.x + this.protogonistBox.w/2, this.protogonistBox.y + this.protogonistBox.h/2,  
                this.obstacles[i].aboveObstacle.x, this.obstacles[i].aboveObstacle.y, this.obstacles[i].aboveObstacle.w, this.obstacles[i].aboveObstacle.h  ) )
                return true;

            if ( IsInside ( this.protogonistBox.x + this.protogonistBox.w/2, this.protogonistBox.y + this.protogonistBox.h/2,  
                            this.obstacles[i].belowObstacle.x, this.obstacles[i].belowObstacle.y, this.obstacles[i].belowObstacle.w, this.obstacles[i].belowObstacle.h  ) )
                return true;


        }

        return false;
    }

    this.OnLostEvent  = function ()
    {
        if ( this.gameOver )
        {
            console.log("ERROR. we shouldnt be here again");
            return;
        }

        console.log("gameOver");
        this.gameOver = true;
        this.retryButton.SetVisibility ( true );
    }

    this.OnMouseDown = function( x, y )
    {
        this.ui.OnMouseDown ( x, y );
    }
    this.OnMouseUp = function( x, y )
    {
        this.ui.OnMouseUp ( x, y );
    }
    
    this.OnKeyPress = function ( keyCode )
    {
        if (keyCode == '38') 
        {
            //console.log("here");
            this.protogonistBox.IncreaseForce ( upArrowPushForce * dt/1000 );
        }
        else if (keyCode == '40') {
            // down arrow
        }
        else if (keyCode == '37') {
           // left arrow
        }
        else if (keyCode == '39') {
           // right arrow
        }
    }



    this.CreateAnObstacle = function( positionX, gap )
    {
        let newObstacle = new Obstacle ( positionX, gap );
        this.obstacles.push ( newObstacle );
        return newObstacle;
    }
    this.DestroyAnObstacle = function ( obstacle )
    {
        let index = this.obstacles.indexOf ( obstacle );
        if ( index >= 0 )
        {
            //console.log ("Splicing:" + index + " " + obstacles.length);
            this.obstacles.splice ( index, 1 );
            //console.log ("After Splicing:" + index + " " + obstacles.length);
        }
    }
}


// Application Touch 
function checkDown(e) 
{

    touchVar = e || window.event;
    //console.log("here1");
}
function checkUp(e)
{
    touchVar = undefined;
    //console.log("here2");
}

function OnKeyPress ( e) 
{
    if ( e == null || e == undefined )
        return;

    MyApplicationInstance.StateManager.OnKeyPress ( e.keyCode );
}

function OnMouseDown(evt) 
{
    var mousePos = GetMousePosFromCanvas( renderer.canvas, evt);

    if ( renderer.InvertYEnabled() )
    {
        mousePos.y = renderer.Height() - mousePos.y;
    }

    if ( MyApplicationInstance.StateManager != null )
        MyApplicationInstance.StateManager.OnMouseDown ( mousePos.x, mousePos.y );

    console.log('OnMouseDown ' + mousePos.x + " " + mousePos.y );
}
function OnMouseUp(evt) 
{
    var mousePos = GetMousePosFromCanvas( renderer.canvas, evt);

    if ( renderer.InvertYEnabled() )
    {
        mousePos.y = renderer.Height() - mousePos.y;
    }

    if ( MyApplicationInstance.StateManager != null )
        MyApplicationInstance.StateManager.OnMouseUp ( mousePos.x, mousePos.y );

    console.log('OnMouseUp ' + mousePos.x + " " + mousePos.y );
}

//Function to get the mouse position
function GetMousePosFromCanvas(canvas, event) 
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}





// Utilities for in-Game
function CreateABox ()
{
    let newBox = new Box();
    return newBox;
}
function DestroyABox( box )
{
    // let index = allBoxes.indexOf ( box );
    // if ( index >= 0 )
    //     allBoxes.splice ( index );
}




function Box ( )
{
    this.x = 0;
    this.y = 0;
    this.w = 0; 
    this.h = 0;
    
    this.color = ""; //"red"
    this.force = 0;

    this.SetY = function ( y ) { this.y = y; }
    this.SetForce = function ( force ) { this.force = force; }
    this.Maxforce = function () { return MaxForceInAnyDirection; }

    this.isKinematic = true;
    
    this.SetPosition = function ( x, y ) { this.x = x; this.y = y; }
    this.SetDimention = function ( w, h ) { this.w = w; this.h = h; }
    this.SetColor = function ( color ) { this.color = color; }
    this.SetKinematic = function ( isKinematic ) { this.isKinematic = isKinematic; }

    this.SetAll = function ( x, y, w, h, color, isKinematic ) { this.SetPosition ( x, y ); this.SetDimention ( w, h ); this.SetColor ( color ); this.SetKinematic(isKinematic); }
    this.IsAffectedByGravity = function() { return !this.isKinematic; }
    this.IncreaseForce = function ( value ) 
    { 
        this.force = this.force + value;  
        //console.log(this.force);
        if ( Math.abs ( this.force ) > this.Maxforce() )
        {
            this.force = Math.sign ( this.force ) * this.Maxforce();
        }
    }
}

function Obstacle ( positionX, minGap)
{
    this.aboveObstacle = CreateABox();
    this.belowObstacle = CreateABox();

    let gap = getRandomArbitrary ( minGap, minGap /*MyApplicationInstance.GameHeight()*/ );

    
    this.aboveObstacle.w = 10;
    this.aboveObstacle.h = getRandomArbitrary ( 0, MyApplicationInstance.GameHeight() - gap );
    this.aboveObstacle.y = MyApplicationInstance.GameHeight() - ( this.aboveObstacle.h / 2 );
    this.aboveObstacle.x = positionX;
    this.aboveObstacle.color = "grey";

    this.belowObstacle.w = 10;
    this.belowObstacle.h = MyApplicationInstance.GameHeight() - gap - this.aboveObstacle.h;
    this.belowObstacle.y = this.belowObstacle.h/2;
    this.belowObstacle.x = positionX;
    this.belowObstacle.color = "grey";

    this.Speed = function () { return obstacleMovementSpeed; }

    this.Move = function ( dt )
    {
        this.aboveObstacle.x -= this.Speed() * dt;
        this.belowObstacle.x -= this.Speed() * dt;
    }
}




// Utility

function Point ( )
{

}


function IsBoxColliding ( box1, box2 )
{

}
function IsPointInsideBox ( box, point )
{

}
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



// //Function to check whether a point is inside a rectangle
// function isInside(pos, rect){
//     return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
// }

// //The rectangle should have x,y,width,height properties
// var rect = {
//     x:250,
//     y:150,
//     width:200,
//     height:100
// };
//Binding the click event on the canvas
