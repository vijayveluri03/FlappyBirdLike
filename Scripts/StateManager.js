"use strict";

function StateManager ()
{
    this.states = [];
    this.pushState = null;
    this.popState = false;
    this.PushState = function ( state )
    {
        if ( this.pushState != null )
            alert ( "ERROR in state pushing");
        this.pushState = state;
    }
    this.PopState = function() 
    {
        if ( this.popState == true )
            alert ( "ERROR in state poping");

        this.popState = true;
    }
    this.ClearAll = function () 
    {
        console.log("TODO. properly clean this up ");
        this.states = [];
    }

    this.CurrentState = function()
    {
        if ( this.states.length <= 0 )
            return null;
        return this.states[ this.states.length - 1 ];
    }

    this.Update  = function ()
    {
        if ( this.popState )
        {
            let x = this.states.pop();
            this.popState = false;

            if ( x != null )
                x.End();
        }
        if ( this.pushState != null )
        {
            this.pushState.Start();

            this.states.push ( this.pushState );
            this.pushState = null;
        }

        if ( this.CurrentState() != null )
            this.CurrentState().Update ();
    }
    this.Render  = function ()
    {
        if ( this.CurrentState() != null )
            this.CurrentState().Render ();
    }
    this.OnMouseDown = function ( x, y )
    {
        if ( this.CurrentState() != null )
            this.CurrentState().OnMouseDown (x,y);
    }
    this.OnMouseUp = function ( x, y )
    {
        if ( this.CurrentState() != null )
            this.CurrentState().OnMouseUp (x,y);
    }

    this.OnKeyPress = function ( keyCode )
    {
        if ( this.CurrentState() != null )
            this.CurrentState().OnKeyPress (keyCode);
    }
};