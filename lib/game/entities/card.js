ig.module(
	'game.entities.card'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityCard = ig.Entity.extend({
	
	size: {x:44, y:60},
	collides: ig.Entity.COLLIDES.ACTIVE,
	card:{'cardId':0},
    gravityFactor:1.3,
    vel: {x:0,y:150},
	
	animSheet: new ig.AnimationSheet( 'media/cards.gif', 44, 60 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
       this.addAnim('idle', 1, [this.card.cardId]);
 		
 	},
    
    update: function()
    {
        this.parent();
        var clicked = ig.input.pressed('leftmouseclick' );
        if (clicked && this._inCard())
        {   
            dojo.publish("cardClicked",[this]);            
        }
    },
    
    _inCard: function() {
      return ig.input.mouse.x + ig.game.screen.x > this.pos.x && 
             ig.input.mouse.x + ig.game.screen.x < this.pos.x + this.size.x &&
             ig.input.mouse.y + ig.game.screen.y > this.pos.y && 
             ig.input.mouse.y + ig.game.screen.y < this.pos.y + this.size.y;
    }
});

});