ig.module(
	'game.entities.banana'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityBanana = ig.Entity.extend({
	
	size: {x:44, y:44},
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0,
	animSheet: new ig.AnimationSheet( 'media/sparkle.png', 44, 44 ),
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 0.3, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] );
		
	}
});

});