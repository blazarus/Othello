$(document).ready(function() {
	
	$('#gameboard').click( function (e) {
		var cell = getCursorPosition(e);
		var valid = game.makeMove(cell.xCoord, cell.yCoord);
		if (valid) { 
			drawBoard();
			var validMoves = game.getCurrentValidMoves();
			if (validMoves.length === 0 && game.isInProgress() && game.isGameOver()) { finishGame(); }
			console.log(game.getBoard().toString());
			console.log("It is now " + game.getCurrentPlayer().getName() + "'s turn");
		}
		checkButtons();
		updateScoreboard();
	} );
	
	$('#btnUndoMove').click( function (e) {
		game.undoMove();
		drawBoard();
		checkButtons();
		updateScoreboard();
		var validMoves = game.getCurrentValidMoves();
		if (validMoves.length === 0 && game.isInProgress() && game.isGameOver()) { finishGame(); }
	} );
	$('#btnRedoMove').click( function (e) {
		game.redoMove();
		drawBoard();
		checkButtons();
		updateScoreboard();
		var validMoves = game.getCurrentValidMoves();
		if (validMoves.length === 0 && game.isInProgress() && game.isGameOver()) { finishGame(); }
	} );
	$('#btnPass').click( function (e) {
		game.changeTurn();
		drawBoard();
		checkButtons();
		updateScoreboard();
		var validMoves = game.getCurrentValidMoves();
		if (validMoves.length === 0 && game.isInProgress() && game.isGameOver()) { finishGame(); }
	} );
	
	var highlighted = undefined;
	$('#gameboard').mousemove( function (e) {
		var curPos = getCursorPosition(e);
		var cell = { x:curPos.xCoord, y:curPos.yCoord };
		if (cell !== highlighted) {
			var validMoves = game.getCurrentValidMoves();
			if (validMoves.length === 0 && game.isInProgress() && game.isGameOver()) { finishGame(); }
			
			for (var i in validMoves) {
				var x = validMoves[i].x;
				var y = validMoves[i].y;
				if (cell.x === x && cell.y === y) {
					highlighted = cell;
					drawBoard();
					var ctx = getGameboard();
					ctx.fillStyle = "white";
					ctx.fillRect(cell.x*50,cell.y*50,50,50);
					ctx.fillStyle = "rgba(0, 100, 255, 0.5)";
					ctx.fillRect(cell.x*50,cell.y*50,50,50);
					this.style.cursor= "pointer";
					return;
				}
				this.style.cursor= "default";
			} 
			
			drawBoard();
			hightlighted = undefined;
			
		} 
		
		
	})
	
	createNewGamePopup();
	//Start the game!
	newGame("human","computer");	
});

var game;		

var getGameboard = function () {
	var gameboard = document.getElementById("gameboard");

	if (gameboard.getContext) {
        return gameboard.getContext("2d");
	}
}

var drawBoard = function () {
	var ctx = getGameboard();

    for (var i = 0; i < 8; i++) {
    	for (var j = 0; j < 8; j++) {
    		if ((i % 2 === 0 && j % 2 === 1) || (i % 2 === 1 && j % 2 === 0)) {
				ctx.fillStyle = "gray";
				ctx.fillRect(i*50,j*50,50,50);
    		} else {
				ctx.fillStyle = "white";
				ctx.fillRect(i*50,j*50,50,50);
			}
    	}
    }
	
	var pieces = game.getBoard().getAllPieces();
	for (var i in pieces) {
		drawPiece(pieces[i].x,pieces[i].y,pieces[i].isLight());
	}
};

var drawPiece = function (i,j,isLight) {
	var ctx = getGameboard();
	var radius = 25;
	x = i*50 + radius;
	y = j*50 + radius;
	if (isLight) { ctx.fillStyle = "red"; }
	else { ctx.fillStyle = "black"; }
	ctx.beginPath();
	ctx.arc(x,y,radius,0,Math.PI*2,false);
	ctx.closePath();
	ctx.fill();
};

var getCursorPosition = function (e) {
	var x = e.pageX - $('#gameboard').offset().left;
	var y = e.pageY - $('#gameboard').offset().top;

	var xCoord = Math.floor(x/50);
	var yCoord = Math.floor(y/50);

	return { xCoord:xCoord, yCoord:yCoord };
};

var newGame = function (p1Type,p2Type) { //String - either "human" or "computer"
	var p1 = new Player("Red",true,p1Type);
	var p2 = new Player("Black",false,p2Type);
	
	game = new Game(p1,p2);
	//Choose random player to go first
	if (Math.random() >= .5) { game.changeTurn(); }
	else if (!p1.isHuman()) { 
		game.getCurrentPlayer().makeBestMove(game.getBoard());
		game.changeTurn();
	}
	console.log(game.getBoard().toString());
	drawBoard();
	checkButtons();
	updateScoreboard();
};

var updateScoreboard = function () {
	$("#playersTurn").text(game.getCurrentPlayer() + ", it's your turn...");
	$("#p1score").text(game.getP1().toString() + " player (" + (game.getP1().isHuman() ? "human" : "computer") + ") Score: " + game.getP1Score());
	$("#p2score").text(game.getP2().toString() + " player (" + (game.getP2().isHuman() ? "human" : "computer") + ") Score: " + game.getP2Score());
};

var finishGame = function () {
	var winner = game.getLeader();
	checkButtons();
	updateScoreboard();
	alert("The winner is: " + winner.toString());
};

var checkButtons = function () {
	$('#btnUndoMove').attr("disabled", !(game.isInProgress() && game.canUndo()));
	$('#btnRedoMove').attr("disabled", !(game.isInProgress() && game.canRedo()));
	$('#btnPass').attr("disabled", !game.isInProgress());
};



var createNewGamePopup = function () {
	//Create div that will have content of popup
	var newGamePopupDiv = $("<div>").attr("id","newGamePopupContainer");
	var bgPopup = $("<div>").attr("id","backgroundPopup");
	var p1Setup = $("<div>").attr("id","p1Setup");
	var p2Setup = $("<div>").attr("id","p2Setup");
	
	newGamePopupDiv.append($("<h2>").text("Game Setup"));
	newGamePopupDiv.append($("<p>").text("Enter the player type as either 'human' or 'computer'"));
	
	var data = {
	    'human': 'Human',
	    'computer': 'Computer'
	}
	var p1Input = $('<select />');
	var p2Input = $('<select />');

	for(var val in data) {
	    p1Input.append($('<option />', { value: val, text: data[val] }));
		p2Input.append($('<option />', { value: val, text: data[val] }));
	}
	
	p1Setup.append($("<p>").attr("class","label").text("Player 1:"));
	p1Setup.append(p1Input);
	
	p2Setup.append($("<p>").attr("class","label").text("Player 2:"));
	p2Setup.append(p2Input);
	
	var pSetupContainer = $("<div>").attr("id","pSetupContainer")
									.append(p1Setup).append(p2Setup);
	
	newGamePopupDiv.append(pSetupContainer).append($("<p>").text(""));
	
	var startGameButton = $("<button>");
	startGameButton.attr("id","startGameButton");
	startGameButton.text("Start Game");
	startGameButton.click( function () {
		disableNewGamePopup();
		newGame(p1Input.val(),p2Input.val());
	});
	newGamePopupDiv.append(startGameButton);
	
	$('body').append(newGamePopupDiv);
	$('body').append(bgPopup);
	
	//Adapted code and css from example at:
	//http://yensdesign.com/2008/09/how-to-create-a-stunning-and-smooth-popup-using-jquery/
	
	//SETTING UP OUR POPUP  
	//0 means disabled; 1 means enabled;  
	var popupStatus = 0;

	var loadNewGamePopup = function () {  
		//loads popup only if it is disabled  
		if(popupStatus === 0){  
			bgPopup.fadeIn("slow");  
			newGamePopupDiv.fadeIn("slow");  
			popupStatus = 1;  
		}  
	};

	var disableNewGamePopup = function () {   
		//disables popup only if it is enabled  
		if (popupStatus === 1) {  
			bgPopup.fadeOut("slow");  
			newGamePopupDiv.fadeOut("slow");  
			popupStatus = 0;  
		}  
	}

	//centering popup  
	var centerNewGamePopup = function (){  
		//request data for centering  
		var windowWidth = document.documentElement.clientWidth;  
		var windowHeight = document.documentElement.clientHeight;  
		var popupHeight = newGamePopupDiv.height();  
		var popupWidth = newGamePopupDiv.width();  
		//centering  
		newGamePopupDiv.css({  
			"position": "absolute",  
			"top": windowHeight/3-popupHeight/2,  
			"left": windowWidth/2-popupWidth/2  
		});  
	};
	
	$('#btnNewGame').click( function () {
		//centering with css  
		centerNewGamePopup();  
		//load popup  
		loadNewGamePopup();
	});
	
	//CLOSING POPUP  
	//Click out event 
	bgPopup.click(function(){  
		disableNewGamePopup();  
	});  
}