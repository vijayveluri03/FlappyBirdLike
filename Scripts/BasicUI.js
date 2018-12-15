"use strict";

let uiRenderer = null;

function InitUI ( canvas )
{
    uiRenderer = canvas;
}
function ProcessUI ( canvas )
{

}

function UI ()
{
    this.isVisible = false;
    this.buttons = [];
    this.texts = [];

    this.Init = function ( visible ) 
    { 
        this.SetVisibility ( visible );
    }
    this.SetVisibility = function ( visible ) { this.isVisible = visible; }

    this.CreateButton = function() 
    {  
       let btn = new Button(); 
       this.buttons.push ( btn );
       return btn;
    }

    this.CreateText = function() 
    {  
       let txt = new Text(); 
       this.texts.push ( txt );
       return txt;
    }


    this.Render  = function () 
    {
        if ( this.isVisible == false )
            return;

        for ( let i = 0; i < this.buttons.length; i ++ )
        {
            this.buttons[i].Render();
        }
        for ( let i = 0; i < this.texts.length; i ++ )
        {
            this.texts[i].Render();
        }
    }

    this.OnMouseDown  = function (x, y) 
    {
        if ( !this.isVisible )
            return;

        for ( let i = 0; i < this.buttons.length; i ++ )
        {
            this.buttons[i].OnMouseDown(x, y);
        }
    }

    this.OnMouseUp  = function (x, y) 
    {
        if ( !this.isVisible )
            return;

        for ( let i = 0; i < this.buttons.length; i ++ )
        {
            this.buttons[i].OnMouseUp(x, y);
        }
    }
}

function Button ( )
{
    this.x = 0;
    this.y = 0;
    this.w = 0; 
    this.h = 0;

    this.image = null;

    this.isVisible = false;
    
    this.color = ""; //"red"
    this.disabledColor = "";
    this.selectedColor = "";
    this.text = "";
    this.fontType = "";
    this.fontColor = "";
    this.fontHeightInPX = "";

    this.isPressed = false;
    this.onClickedCallback = null;

    this.userData = null;
    this.isDisabled = false;

    this.Init = function ( x, y, w, h, 
        fontType, text, 
        fontcolor, fontHeight,
        color, disabledColor, selectedColor, 
        onClickedCallback,
        visible ) 
    { 
        this.SetPosition ( x, y ); 
        this.SetDimention ( w, h ); 
        
        this.SetFontType ( fontType );
        this.SetText ( text );
        
        this.SetFontColor ( fontcolor );
        this.SetFontHeight ( fontHeight );

        this.SetColor ( color, disabledColor, selectedColor ); 

        this.SetOnClickCallback ( onClickedCallback );
        this.SetVisibility ( visible );
    }

    this.SetDisabled = function ( disabled ) { this.isDisabled = disabled; }
    this.SetImage = function ( image ) { this.image = image; }
    this.SetVisibility = function ( visible ) { this.isVisible = visible; }
    this.SetFontType = function ( font ) { this.fontType = font; }
    this.SetFontColor = function ( color ) { this.fontColor = color; }
    this.SetFontHeight = function ( height ) { this.fontHeightInPX = height; }
    this.SetText = function ( text ) { this.text = text; }
    this.SetPosition = function ( x, y ) { this.x = x; this.y = y; }
    this.SetDimention = function ( w, h ) { this.w = w; this.h = h; }
    this.SetOnClickCallback = function ( onclick ) { this.onClickedCallback = onclick; }
    this.SetColor = function ( normalColor, disabledColor, selectedColor ) { this.color = normalColor; this.disabledColor = disabledColor; this.selectedColor = selectedColor; }
    this.SetUserData = function ( userdata ) { this.userData = userdata; }


    this.OnMouseDown = function ( x, y )
    {
        if ( !this.isVisible )
            return;
        if ( this.isDisabled )
            return;

        if ( IsInside ( x, y, this.x, this.y, this.w, this.h  ))
        {
            this.isPressed = true;
        }
    }

    this.OnMouseUp = function ( x, y )
    {
        if ( !this.isVisible )
            return;
        if ( this.isDisabled )
            return;

        if ( IsInside ( x, y, this.x, this.y, this.w, this.h  ))
        {
            if ( this.isPressed ) 
            {
                this.isPressed = false;
                if ( this.onClickedCallback != null )
                    this.onClickedCallback( this );
            }
        }
        this.isPressed = false;
    }

        
    this.Render = function ()
    {
        if ( this.isVisible == false )
            return;

        uiRenderer.RenderButton ( this );
    }

    //this.OnMousePress = function
}

function Text ( )
{
    this.x = 0;
    this.y = 0;
    this.w = 0; 
    this.h = 0;

    this.isVisible = false;
    
    this.text = "";
    this.fontType = "";
    this.fontColor = "";
    this.fontHeightInPX = "";

    this.isPressed = false;

    this.Init = function ( x, y, w, h, 
        fontType, text, 
        fontcolor, fontHeight,
        visible ) 
    { 
        this.SetPosition ( x, y ); 
        this.SetDimention ( w, h ); 
        
        this.SetFontType ( fontType );
        this.SetText ( text );
        
        this.SetFontColor ( fontcolor );
        this.SetFontHeight ( fontHeight );

        this.SetVisibility ( visible );
    }

    this.SetVisibility = function ( visible ) { this.isVisible = visible; }
    this.SetFontType = function ( font ) { this.fontType = font; }
    this.SetFontColor = function ( color ) { this.fontColor = color; }
    this.SetFontHeight = function ( height ) { this.fontHeightInPX = height; }
    this.SetText = function ( text ) { this.text = text; }
    this.SetPosition = function ( x, y ) { this.x = x; this.y = y; }
    this.SetDimention = function ( w, h ) { this.w = w; this.h = h; }


    this.OnMouseDown = function ( x, y )
    {
    }

    this.OnMouseUp = function ( x, y )
    {
    }

        
    this.Render = function ()
    {
        if ( this.isVisible == false )
            return;

        uiRenderer.RenderText ( this );
    }

    //this.OnMousePress = function
}


function IsInside(posx, posy, x, y, w, h)
{
    return posx > ( x - w/2 ) && posx < (x + w/2) && 
            posy > ( y - h/2 ) && posy < ( y + h/2);
}
