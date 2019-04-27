ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
    'game.entities.card',
    'game.entities.banana',
	'game.levels.main'
)
.defines(function(){

Card = ig.Class.extend({
    cardId: 0,
    width:44,
    height:60,
    x:0,
    y:0
});

Hand = ig.Class.extend({
    cardEntities: [],
    handSize: 4,
    points:0,
	flushScore:0,
	highestRun:0,
	runScore:0,
    
		isInHand: function(card)
		{
			return dojo.some(this.cardEntities, function(cardEntity)
			{
				return cardEntity.card.cardId == card.card.cardId;
			});
		},
	
	
    clear: function()
    {
        dojo.forEach(this.cardEntities, function(c) {
            c.kill();
        });
        this.cardEntities = [];
    },
    
    isComplete: function()
    {
        return (this.cardEntities.length === this.handSize);
    },
    
    add: function(cardEntity, addAfterComplete)
    {   var added = false;
        if (dojo.indexOf(this.cardEntities,cardEntity) > -1)
        {
            return false;
        }
        if (!this.isComplete() || addAfterComplete)
        {   added = true;
            this.cardEntities.push(cardEntity);           
        }
        return added;
    },
    
    isAdjacent: function(entityCard)
    {
        var adjacent = this.cardEntities.length === 0;
        var isWithinOne = function(a, b) {
            return (a === b-1) || (a === b+1);
        
        }
        dojo.forEach(this.cardEntities, function(card)
                     {
                        var cardX = Math.floor(card.pos.x / 44);
                        var cardY = Math.floor(card.pos.y / 60);
                        var entityCardX = Math.floor(entityCard.pos.x / 44);
                        var entityCardY = Math.floor(entityCard.pos.y / 60);
                        if (!adjacent && (cardX === entityCardX) && isWithinOne(cardY,entityCardY))
                        {
                            adjacent = true;
                        }
                        if (!adjacent && (cardY === entityCardY) && isWithinOne(cardX,entityCardX))
                        {
                            adjacent = true;
                        }
                     });
        
        return (adjacent);
    },
    
    score: function(){
        this.points = 0;
        this.flushScore = 0;
        this.runScore = 0;
        
         this.startingCard = this.cardEntities[4];
		 for (var i=0;i<5;i++) {
		 	console.log(this.cardEntities[i].card);
	 	}
		 var  permute = function (items){
		          var perms = [];
		          for (var i=0, ii=items.length; i<ii; i++){
		              var base = [items[i]];
		              perms.push(base);
		              var subitems = permute(items.slice(i+1));
		              var j = subitems.length;
		              while (j--){
		                  perms.push(base.concat(subitems[j]));
		              }
		          }
		          return perms;
		      };
		 
	     var applyToConsquetivePermutations = function(items, pFunc) {
	         var startingItem = items.length-1;
	         var checkConsequetive = function(i, pFunc) {
	             if (i == 0) { return true; };
	             return pFunc(items[i], items[i-1]) && checkConsequetive(i-1,pFunc);
	         }
	         return checkConsequetive(startingItem, pFunc);
	     };
		 
         var sum = function(cards) {
            var s = 0;
            for (var i=0; i<cards.length; i++)
			{
				s += cards[i].card.cardValue;
			}
			
            return s;
         };
         
         // cards must be sorted ascending
         var isStraight = function(cards) {
            return cards.length > 2 && applyToConsquetivePermutations(cards, function(a,b) { return (a.card.cardNumber - b.card.cardNumber == 1); });         
         };
         
         var noStartingCard = function(cards,startingCard)
        {
				var inHand = false;
				for (var i; i<4; i++)
				{
					if (cards.cardId == startingCard.cardId)
					{
						inHand = true;
					}
					
				}
				return inHand;
        };
            
         var isFlush = function(cards) {
            return applyToConsquetivePermutations(cards, function(a,b) { return (a.card.suit == b.card.suit); });         
         };

        var isNobs = function(cards, startingCard) {
            return (cards.length == 1 && cards[0].card.cardNumber == 11 && 
				cards[0].card.suit == startingCard.card.suit && 
				cards[0].card.cardNumber != startingCard.card.cardNumber);
        };
		
		var isPair = function(cards) {
			return cards.length == 2 && cards[0].card.cardNumber == cards[1].card.cardNumber;
		}
		

         var calculatePoints = function(handPermutation) {
			 var p = 0;
            handPermutation.sort(function(a,b) { return a.card.cardNumber - b.card.cardNumber; });
            // all of these methods assume the cards are sorted ascending
            if (sum(handPermutation) == 15)   { console.log("15 for 2"); this.points += 2; };
			if (isPair(handPermutation))      { console.log("pair for 2");  this.points += 2; };
            if (isStraight(handPermutation))  { 
				var handLength = handPermutation.length;
				if (handLength > this.highestRun)
				{
					this.runScore = handLength;
					this.highestRun = handLength;
					console.log("run for " + handLength);
				} else if (this.runScore == 0 || handLength == this.highestRun ){
					this.runScore += handLength;
                    this.highestRun = handLength;
					console.log("run for" + handLength);
				}
			}
            
            if (isNobs(handPermutation, this.startingCard))      { console.log("nobs"); this.points +=1; };
			
			return p;
         };
         
         var all = permute(this.cardEntities);
		 var calPoints = dojo.hitch(this, calculatePoints);
			 
		 for (var i=0;i<all.length;i++)
		 {   
			 calPoints(all[i]);
		 }
		 
		 var h = dojo.clone(this.cardEntities);
		 
		 if (isFlush(h))
		 {
			 this.flushScore = 5;
			 console.log("flush for 5");

		 } else if (isFlush(h.slice(0,4)))
		 {	
			 this.flushScore = 4;
			 console.log("flush for 4");
		 }
         this.points += (this.flushScore + this.runScore);
		 
    	 console.log(this.points);
         return this.points;
     }

 

});

Deck = ig.Class.extend({
  
    decks: 1,  // not supported yet
	totalDeckSize: 51, // default is one deck
    deck: new Array(),
    currentCard: 0,
    empty: false,


	
    init: function()
    {	
		this.totalDeckSize = this.decks*51;
        for(var i=0;i<=this.totalDeckSize;i++){
            // fill deck
            this.deck[i] = new Card();
            this.deck[i].cardId = i;
            this.deck[i].suit = this.getSuit(this.deck[i].cardId);
			this.deck[i].cardNumber = this.getCardNumber(this.deck[i].cardId); 
            this.deck[i].cardValue = this.getCardValue(this.deck[i].cardNumber);
        }
       this.shuffle();    
    },
	
	getSuit: function(cardId)
	{
		var c = cardId;
		var suit = 0;
		while (c < 52)
		{
			suit += 1;
			c += 13
		}
		return suit;
	},
    
	getCardNumber: function(cardId) {
    var c = cardId+1;
    while (c > 13) { c -= 13; }
	
    return c;
		
	},
		
    getCardValue: function(cardId)
    {
        var c = cardId;
        
		if (c >= 11) { c = 10; }
        return c;
    },
    
    shuffle: function()
    {   
        for(i=0;i<this.deck.length*6;i++){
            j = Math.floor(Math.random()*this.deck.length) % (this.deck.length - i%6);
            if(j > 0){
                a = this.deck.slice(j);
                a.reverse();
                this.deck.splice(j);
                this.deck = a.concat(this.deck);
            }
        }
        this.currentCard = 0;
    },
    
	isEmpty: function()
	{
		return (this.currentCard == this.totalDeckSize);
	},
	
    nextCard: function() {
		if (this.isEmpty())
		{
			this.shuffle();
		}
        var card = this.deck[this.currentCard];
        this.currentCard = this.currentCard + 1;	
        return card;
    }
	
	
});

MyGame = ig.Game.extend({
	
    gravity: 1050,

	// Load a font
	font: new ig.Font( 'media/04b03.font.png', {"height":24}),
	deck: new Deck({'decks':1}),
    pucks: [],
	horizontal: 6,
    vertical: 6,
    initialized: false,
    hand: new Hand(),
    scoreHand: new Hand(),
    clearHandOnNextClick: false,
    score: 0,
	gameOver:false,
	highScore:0,
	lastScore:0,
	handComplete: false,
    turnsRemaining: 12,
	GAME_TURNS:12,
	
	init: function() {
		ig.input.bind( ig.KEY.MOUSE1, 'leftmouseclick' );
		dojo.subscribe("cardClicked", dojo.hitch(this, this.cardClicked));
        dojo.subscribe("cardRemovedFromHand",dojo.hitch(this, this.cardRemovedFromHand));
		this.loadLevel( LevelMain );
	    this.placeCards();
        this.update();
	},
    
    cardRemovedFromHand: function(x,y,entityCard)
    {
          this.placeCard(x,0,this.deck.nextCard());
    },
    
    cardClicked: function(entityCard)
    {
        if (this.clearHandOnNextClick)
        {   this.clearHandOnNextClick = false;
            this.startNextHand();
        } else {
            this.cardSelected(entityCard);            
        }
   },
    
    startNextHand: function()
    {
        dojo.forEach(this.pucks, function(puck) { puck.kill(); });
    	dojo.forEach(this.hand.cardEntities, dojo.hitch(this,function(entityCard)
                     {
                        this.spawnEntity( EntityCard, entityCard.pos.x, -200, {'card':this.deck.nextCard()})
                     }
                     ));
        this.hand.clear();
        this.scoreHand.clear();
        
    },
    
    cardSelected: function(entityCard)
    {
               if (!this.hand.isComplete() && this.hand.isAdjacent(entityCard) && !this.hand.isInHand(entityCard))
      {
            if (this.hand.add(entityCard))
            {
                this.placePuck(entityCard);
                this.scoreHand.add(this.spawnEntity( EntityCard, 700, 0, {'card':entityCard.card}));

                if (this.hand.isComplete())
                {
                    this.onHandComplete();
                }
            } 
            
       }

    },
    
    onHandComplete: function()
    {
		if (this.turnsRemaining == 1)
		{	this.turnsRemaining = 0;
			setTimeout(dojo.hitch(this, function() { this.gameOver = true;}),500);
			this.killCards();
			return;
		}
		
		this.handComplete = true;
	     setTimeout(dojo.hitch(this, function() {
            this.scoreHand.add(this.spawnEntity( EntityCard, 273, 0, {'card':this.deck.nextCard()}), true);
			var handScore = this.scoreHand.score();
		this.score += handScore;
		this.lastScore = handScore;

	    },1000));
		this.turnsRemaining = this.turnsRemaining - 1;
        this.clearHandOnNextClick = true;  
    },
    
    placePuck: function(entityCard)
    {
        this.pucks.push(this.spawnEntity( EntityBanana, entityCard.pos.x, entityCard.pos.y+10));
    },
	
	startNewGame: function()
	{
		this.deck.shuffle();
	    this.hand.clear();
	    this.scoreHand.clear();
	    this.clearHandOnNextClick = false;
	    this.score = 0;
		this.gameOver = false;
		this.lastScore = 0;
		this.handComplete = false;
		this.turnsRemaining = this.GAME_TURNS;
		this.placeCards();
	},
    
	getTurnsRemaining: function()
	{
		this.turnsRemaining = this.deck.getRemainingCardCount()
	},
	
    placeCards: function()
    {
            for (var x=0; x<this.horizontal; x++)
            {
                for (var y=this.vertical-1; y>=0; y--)
                {
                    this.placeCard(x,y,this.deck.nextCard());
                }
            }
    },
    
    placeCard: function(i,j,card)
    {
        var x = this.getX(i,card);
        var y = this.getY(j,card);
        this.spawnEntity( EntityCard, x, y, {'card':card, 'x':i, 'y':j});
    },
	
    getX: function(i,card)
    {
        return i*(card.width);
    },
    
    getY: function(j,card)
    {
        return j*(card.height)   - 100;
    },
	
	update: function() {
   
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
		if (this.gameOver && this.score > this.highScore)
		{
			this.highScore = this.score;
		}
		
		 
	 if (this.gameOver && ig.input.pressed('leftmouseclick' ))
	 {
		 this.startNewGame();
	 }
		 
		

	},
	
	killCards: function()
	{
		dojo.forEach(this.entities, function(e) { e.kill(); });	
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();

		 ig.system.context.font = "12pt Calibri Bold";
		 ig.system.context.fillStyle = "#FFFFFF";
	     ig.system.context.fillText("Score: " + this.score, 5, 12);

		 ig.system.context.fillText("High: " + this.highScore, 80, 12);
		 ig.system.context.fillText("Last: " + this.lastScore, 150, 12);
		 ig.system.context.fillText("Turns Left: " + this.turnsRemaining, 215, 12);
		 if (this.gameOver)
	     {

			 ig.system.context.font = "30pt Calibri Bold";
			 ig.system.context.fillText("Game Over!", 24, 200);	 	
			 ig.system.context.font = "20pt Calibri Bold";
			 ig.system.context.fillText("Click to play again", 20, 250);	 	
		 }
    }
});


ig.main( '#canvas', MyGame, 60, 320, 400, 1 );

});
