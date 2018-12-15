"use strict";
document.onkeydown = checkDown;
document.onkeyup = checkUp;




// Design data 
const MaxForceInAnyDirection = 500;
const gravity = -400;
const upArrowPushForce = 250;

const verticalGapBetweenObstaclesMin = 120;
const verticalGapBetweenObstaclesMax = 180;

const distanceBetweenObstaclesMin = 120;
const distanceBetweenObstaclesMax = 220;

const obstacleWidthMin = 20;
const obstacleWidthMax = 80;

const birdBoxW = 15;
const birdBoxH = 15;

const obstacleMovementSpeed = 100;
const protogonistUpwardForceCoolDownTime = 0.25;
const protogonistStartPos = { x:30, y:200 };

const totalTime = 120; // seconds

const renderWidth = 500;
const renderHeight = 300;

const scaleUp = 1.5;
const gameSpeed = 2;



let lastUpdate = Date.now();
let dt = 0;
var touchVar = null;
let isGamePaused = false;
let obstacleID = 1;





// Loads the game up 
function loadGame() 
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

// My application class which has all important links
var MyApplicationInstance = 
{
    gameWidth : renderWidth,
    gameHeight : renderHeight,

    currentTime : 0,

    GameWidth : function() { return renderWidth; },
    GameHeight : function() { return renderHeight; },

    StateManager : new StateManager(),

    Initialize: function ( )
    {
        this.frameNumber = 0;
        lastUpdate = Date.now();
        
        this.interval = setInterval(this.UpdateGameLoop, 0 );
    },
    Start : function () 
    {
        this.StateManager.PushState( new StartMenuState() );
    },
    Restart: function () 
    {
            
        this.StateManager.ClearAll();
        this.StateManager.PushState( new StartMenuState() );
    },

    // the main update method which updates everything else 
    UpdateGameLoop: function()
    {
        var now = Date.now();
        dt = now - lastUpdate;
        dt = dt * gameSpeed;
        lastUpdate = now;
        dt = dt / 1000; 

        renderer.ClearScreen(); // clearing the screen 
        OnKeyPress(touchVar);   // sending touch events to the game 

        // updating and rendering the states
        if ( MyApplicationInstance.StateManager != null )
        {
            MyApplicationInstance.StateManager.Update( dt );
            MyApplicationInstance.StateManager.Render();
        }
    }
}


// A rendering class which takes care of all rendering 
var renderer = 
{
    canvas : null,
    context : null, 
    InitializeGraphics : function( width, height ) 
    {
        this.canvas = document.getElementById("canvas-game"); // Fetching the game canvas from html
        this.canvas.width = width * scaleUp;    // the window is scaled up based on the scale we set
        this.canvas.height = height * scaleUp; // the window is scaled up based on the scale we set
        this.context = this.canvas.getContext("2d");
    },
    ClearScreen : function() 
    {
        this.context.clearRect(0, 0, this.canvas.width * scaleUp, this.canvas.height * scaleUp);
    },
    RenderBox : function( box, point = null )
    {
        this.context.fillStyle = box.color;
        if ( this.InvertYEnabled() )
        {
            this.context.fillRect((box.x - box.w/2) * scaleUp, (this.Height() - ( box.y + box.h/2 )) * scaleUp , box.w * scaleUp, box.h * scaleUp);
        }
        else
            this.context.fillRect(box.x - box.w/2, box.y - box.h/2, box.w, box.h);
    },
    RenderBox : function( box, point = null )
    {
        this.context.fillStyle = box.color;
        if ( this.InvertYEnabled() )
        {
            this.context.fillRect((box.x - box.w/2) * scaleUp, (this.Height() - ( box.y + box.h/2 ) ) * scaleUp, box.w * scaleUp, box.h * scaleUp);
        }
        else
            this.context.fillRect(box.x - box.w/2, box.y - box.h/2, box.w, box.h);
    },
    RenderText : function ( textUi )
    {
        this.context.fillStyle = textUi.fontColor;
        this.context.font = textUi.fontType;

        if ( this.InvertYEnabled() )
        {
            this.context.fillText( textUi.text, textUi.x * scaleUp, (this.Height() - (textUi.y - textUi.fontHeightInPX/2)) * scaleUp );
        }
        else
            this.context.fillText( textUi.text, textUi.x, (textUi.y - textUi.fontHeightInPX/2));

        this.context.textAlign="center"; 
    },
    RenderButton : function ( button )
    {
        if ( button.isPressed )
            this.context.fillStyle = button.selectedColor;
        else    
            this.context.fillStyle = button.color;

        if ( this.InvertYEnabled() )
        {
            this.context.fillRect((button.x - button.w/2) * scaleUp, (this.Height() - ( button.y + button.h/2 )) * scaleUp , button.w * scaleUp, button.h * scaleUp);
        }
        else
            this.context.fillRect(button.x - button.w/2, button.y + button.h/2, button.w, button.h);

        this.context.fillStyle = button.fontColor;
        this.context.font = button.fontType;

        if ( this.InvertYEnabled() )
        {
            this.context.fillText( button.text, button.x * scaleUp, (this.Height() - (button.y - button.fontHeightInPX/2)) * scaleUp );
        }
        else
            this.context.fillText( button.text, button.x, (button.y - button.fontHeightInPX/2));

        this.context.textAlign="center"; 
    },
    Width : function () { return MyApplicationInstance.GameWidth(); },
    Height : function () { return MyApplicationInstance.GameHeight(); },

    InvertYEnabled : function () { return true; }
}





// Main Menu 

function StartMenuState ()
{
    this.Start = function() 
    {
        this.ui = new UI();
        this.ui.Init ( true );

        this.startButton = this.ui.CreateButton ();
        this.startButton.Init ( MyApplicationInstance.GameWidth()/2, 
                                MyApplicationInstance.GameHeight() * 2/4 , 
                                100, 30,

                                (15 * scaleUp) + "px Verdana", "START",
                                "white", 10 /* font height */,

                                "green", "red", "purple", 

                                function() 
                                { 
                                    this.StartCountDown();
                                    //alert("On Start clicked"); 
                                    //MyApplicationInstance.StateManager.PushState ( new InGameState() );
                                }.bind ( this ),

                                true );

        this.instructionsTxt = this.ui.CreateText ();
        this.instructionsTxt.Init ( MyApplicationInstance.GameWidth()/2, 
                                    MyApplicationInstance.GameHeight() * 1/4 ,
                                400, 100,

                                (10 * scaleUp) + "px Verdana", "   Tap to make the bird fly :)",
                                "purple", 7,

                                true );

        this.countDownTxt = this.ui.CreateText ();
        this.countDownTxt.Init ( MyApplicationInstance.GameWidth()/2, 
                                MyApplicationInstance.GameHeight() * 2/4 ,
                            400, 100,

                            (20 * scaleUp) + "px Verdana", "Starts in 3",
                            "red", 10,

                            false );
        
        this.shouldStartCountDown = false;
        this.totalTime = 3;

        
    }
    this.End = function () 
    {
        
    }
    this.StartCountDown = function () 
    {
        this.shouldStartCountDown = true;
        this.startButton.SetVisibility( false );
        //this.instructionsTxt.SetVisibility ( false );
        this.countDownTxt.SetVisibility( true );

    }
    this.Update = function ( dt )
    {
        if ( this.shouldStartCountDown )
        {
            //console.log(" total time : " + this.totalTime  + " dt " + dt );
            this.countDownTxt.SetText ( "Starts in " + Math.floor ( this.totalTime ));
            this.totalTime -= dt;
            if ( this.totalTime < 0 )
            {
                this.shouldStartCountDown = 0;
                MyApplicationInstance.StateManager.PushState ( new InGameState() );
            }
        }
    }

    this.Render = function ()
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
    //this.countDownTxt = null;
    //this.shouldStartCountDown = false;
    //this.totalTime = 3;
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
        this.protogonistBox.SetAll ( protogonistStartPos.x, protogonistStartPos.y, birdBoxW, birdBoxW, "green", false );

        // Creating UI
        {
            this.ui = new UI();
            this.ui.Init ( true );

            // this is a bit of a nonsense since we do not hhave a direct way to create just text
            let scoreBG = this.ui.CreateButton ();
            scoreBG.Init ( MyApplicationInstance.GameWidth() -45, 
                                    MyApplicationInstance.GameHeight() - 20 , 
                                    90, 40,

                                    (25 * scaleUp) + "px Verdana", "",
                                    "black", 15,

                                    "black", "black", "black", 

                                    function() 
                                    { 
                                        //no action here. this is intentional
                                    },

                                    true );
            this.scoreTxt = this.ui.CreateButton ();
            this.scoreTxt.Init ( MyApplicationInstance.GameWidth() -45, 
                                    MyApplicationInstance.GameHeight() - 20 , 
                                    85, 35,

                                    (25 * scaleUp) + "px Verdana", "0",
                                    "purple", 17.5,

                                    "yellow", "yellow", "yellow", 

                                    function() 
                                    { 
                                        //no action here. this is intentional
                                    },

                                    true );


        }

    }
    this.End = function () 
    {

    }
    this.Update = function ()
    {
        if ( isGamePaused )
            return;

        // update 
        if ( !this.gameOver )
        {
            // protogonist
            {
                let box = this.protogonistBox;
                if ( box.IsAffectedByGravity() )
                {
                    box.IncreaseForce ( gravity * dt );
                    if ( box.y > 0 && box.y < MyApplicationInstance.GameHeight() )
                    {
                        box.SetY( box.y + box.force * dt );
                    }
                    
                }
                this.protogonistBox.Update();
            }

            for( let i = 0; i < this.obstacles.length; i++ )
            {
                this.obstacles[i].Update();
                this.obstacles[i].Move ( dt );
            }

            if ( this.DidIJustLose() )
            {
                this.OnLostEvent();
            }
        }

        // Create more obstacles if needed
        {
            let positionX = 0;
            
            //if ( !doINeedMoreObstacles && this.obstacles.length > 0 )
            {
                if (  this.obstacles.length == 0 || this.obstacles[this.obstacles.length - 1].aboveObstacle.x < (MyApplicationInstance.GameWidth() * 2) )
                {
                    while ( this.obstacles.length == 0 || this.obstacles[this.obstacles.length - 1].aboveObstacle.x < (MyApplicationInstance.GameWidth() * 4) )
                    {
                        if ( this.obstacles.length == 0 )
                            positionX = MyApplicationInstance.GameWidth() + 20/* buffer*/;
                        else 
                            positionX = this.obstacles[this.obstacles.length - 1].aboveObstacle.x + this.obstacles[this.obstacles.length - 1].aboveObstacle.w/2 + 
                                        getRandomInt( distanceBetweenObstaclesMin, distanceBetweenObstaclesMax );

                        //if ( doINeedMoreObstacles ) 
                        {
                            var obstacleW = getRandomInt ( obstacleWidthMin, obstacleWidthMax );
                            var obstacleVerticalGap = getRandomInt ( verticalGapBetweenObstaclesMin, verticalGapBetweenObstaclesMax );
                            
                            console.log ( "New obstance is created with ID " + obstacleID + " pos " + positionX + " w " + obstacleW + " vg " + obstacleVerticalGap);
                            this.CreateAnObstacle ( this.obstacleID, positionX, obstacleW, obstacleVerticalGap );
                            obstacleID ++;
                        }
                            
                    }
                }
            }
        }

        // destroy obstacles which have gone out 
        {
            for( let i = 0; i < this.obstacles.length; i++ )
            {
                if ( ( this.obstacles[i].aboveObstacle.x ) < -50 )
                {
                    this.score ++;
                    this.DestroyAnObstacle ( this.obstacles[i]);
                    break;  
                }
            }
            //console.log ( "Obstacle count: " + obstacles.length );
        }

        this.scoreTxt.SetText( "" + this.score);
    }

    this.Render = function () 
    {
        // render 
        {
            renderer.RenderBox ( this.protogonistBox );
            for( let i = 0; i < this.obstacles.length; i++ )
            {
                renderer.RenderBox ( this.obstacles[i].aboveObstacle );
                renderer.RenderBox ( this.obstacles[i].belowObstacle );
            }
        }

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
        MyApplicationInstance.StateManager.PushState ( new EndGameMenuState( this.score ) );
        //this.retryButton.SetVisibility ( true );
    }

    this.OnMouseDown = function( x, y )
    {
        if ( this.protogonistBox != null )
            this.protogonistBox.SetUpwardForce ( upArrowPushForce );
        this.ui.OnMouseDown ( x, y );
    }
    this.OnMouseUp = function( x, y )
    {
        this.ui.OnMouseUp ( x, y );
    }
    
    this.OnKeyPress = function ( keyCode )
    {
        // space
        if (keyCode == '32') 
        {
            //console.log("here");
            isGamePaused = !isGamePaused;

            //this.protogonistBox.SetUpwardForce ( upArrowPushForce );
            //this.protogonistBox.IncreaseForce ( upArrowPushForce * dt/1000 );
        }
        else if (keyCode == '38') 
        {
            //console.log("here");
            //this.protogonistBox.SetUpwardForce ( upArrowPushForce );
            //this.protogonistBox.IncreaseForce ( upArrowPushForce * dt/1000 );
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



    this.CreateAnObstacle = function( id, positionX, width, verticalGap )
    {
        let newObstacle = new Obstacle ( id, positionX, width, verticalGap );
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

// Main Menu 

function EndGameMenuState ( score )
{
    this.Start = function() 
    {
        this.ui = new UI();
        this.ui.Init ( true );


        this.scoreBG = this.ui.CreateButton ();
        this.scoreBG.Init ( MyApplicationInstance.GameWidth() / 2, 
                                    MyApplicationInstance.GameHeight()/2 , 
                                    90, 40,

                                    (25 * scaleUp) + "px Verdana", "",
                                    "black", 15,

                                    "black", "black", "black", 

                                    function() 
                                    { 
                                        //no action here. this is intentional
                                    },

                                    false );
            this.scoreTxt = this.ui.CreateButton ();
            this.scoreTxt.Init ( MyApplicationInstance.GameWidth()/2, 
                                    MyApplicationInstance.GameHeight()/2, 
                                    85, 35,

                                    (25 * scaleUp) + "px Verdana", "0",
                                    "purple", 17.5,

                                    "yellow", "yellow", "yellow", 

                                    function() 
                                    { 
                                        //no action here. this is intentional
                                    },

                                    false );


            this.retryButton = this.ui.CreateButton ();
            this.retryButton.Init ( MyApplicationInstance.GameWidth()*1/2, 
                                    MyApplicationInstance.GameHeight()*1/4 , 
                                    100, 25,
    
                                    (15 * scaleUp) + "px Verdana", "RETRY",
                                    "white", 10,
    
                                    "green", "red", "purple", 
    
                                    function() 
                                    { 
                                        //alert("On Start clicked"); 
                                        MyApplicationInstance.Restart();
                                    },
    
                                    false );

        this.gameOverTxt = this.ui.CreateText ();
        this.gameOverTxt.Init ( MyApplicationInstance.GameWidth()/2, 
                                MyApplicationInstance.GameHeight() * 2/4 ,
                            400, 100,

                            (20 * scaleUp) + "px Verdana", "Game Over !",
                            "red", 10,

                            false );
        
        this.StartCountDown();
        this.totalTime = 3;
    }
    this.End = function () 
    {
        
    }
    this.StartCountDown = function () 
    {
        this.shouldStartCountDown = true;
        //this.startButton.SetVisibility( false );
        //this.instructionsTxt.SetVisibility ( false );
        this.gameOverTxt.SetVisibility( true );

    }
    this.ShowScore = function () 
    {
        this.scoreTxt.SetText ( this.totalScore );
        this.gameOverTxt.SetVisibility ( false );
        this.retryButton.SetVisibility ( true );
        this.scoreBG.SetVisibility ( true );
        this.scoreTxt.SetVisibility ( true );
    }
    this.Update = function ( dt )
    {
        if ( this.shouldStartCountDown )
        {
            //console.log(" total time : " + this.totalTime  + " dt " + dt );
            //this.gameOverTxt.SetText ( "Starts in " + Math.floor ( this.totalTime ));
            this.totalTime -= dt;
            if ( this.totalTime < 0 )
            {
                this.shouldStartCountDown = false;
                this.ShowScore();
            }
        }
    }

    this.Render = function ()
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

    this.totalScore = score;
    this.ui = null;
    this.startButton = null;
    //this.countDownTxt = null;
    //this.shouldStartCountDown = false;
    //this.totalTime = 3;
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

    //console.log('OnMouseDown ' + mousePos.x + " " + mousePos.y );
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

    //console.log('OnMouseUp ' + mousePos.x + " " + mousePos.y );
}

//Function to get the mouse position
function GetMousePosFromCanvas(canvas, event) 
{
    var rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left)/scaleUp,
        y: (event.clientY - rect.top)/scaleUp
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
    this.SetForce = function ( force ) 
    { 
        this.force = force; 
        //console.log(this.force);
        if ( Math.abs ( this.force ) > this.Maxforce() )
        {
            this.force = Math.sign ( this.force ) * this.Maxforce();
        }
    }
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

    this.Update  = function ( )
    {
        if ( this.upwardForceCooldown > 0 )
            this.upwardForceCooldown -= dt;
    }

    this.SetUpwardForce = function ( force ) 
    { 
        if ( this.upwardForceCooldown > 0 )
            return;

        console.log("SetUpwardForce " + this.upwardForceCooldown )
        this.upwardForceCooldown = protogonistUpwardForceCoolDownTime;

        this.SetForce ( force );
    }

    this.upwardForceCooldown = 0;

}

function Obstacle ( id, positionX, width, verticalGap)
{
    this.id = id;

    this.aboveObstacle = CreateABox();
    this.belowObstacle = CreateABox();

    //let gapBetweenTopBarAndBottomBar = verticalGap;
    var randomColor = getRandomInt( 20, 180 );
    
    this.aboveObstacle.w = width;
    this.aboveObstacle.h = getRandomArbitrary ( 0, MyApplicationInstance.GameHeight() - verticalGap );
    this.aboveObstacle.y = MyApplicationInstance.GameHeight() - ( this.aboveObstacle.h / 2 );
    this.aboveObstacle.x = positionX;
    
    this.aboveObstacle.color = rgbToHex( randomColor, randomColor, randomColor );

    this.belowObstacle.w = width;
    this.belowObstacle.h = MyApplicationInstance.GameHeight() - verticalGap - this.aboveObstacle.h;
    this.belowObstacle.y = this.belowObstacle.h/2;
    this.belowObstacle.x = positionX;
    this.belowObstacle.color = rgbToHex( randomColor, randomColor, randomColor );
    this.Update = function () 
    {
        this.aboveObstacle.Update ();
        this.belowObstacle.Update();
    }

    this.Speed = function () { return obstacleMovementSpeed; }

    this.Move = function ( dt )
    {
        this.aboveObstacle.x -= this.Speed() * dt ;
        this.belowObstacle.x -= this.Speed() * dt ;
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

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
