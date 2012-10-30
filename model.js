var Piece = function (x,y,light) {
	this.x = x;
	this.y = y;
	this.isLight = function () {
		return light;
	};
	var makeLight = function () {
		light = true;
	};
	var makeDark = function () {
		light = false;
	};
	this.changeColor = function () {
		light ? makeDark() : makeLight();
	};
	this.toString = function () {
		return "x: " + this.x + ", y: " + this.y + (this.isLight() ? ", is light" : ", is dark");
	};
};


var Player = function(pname,light,human) {
	var score = 0;
	this.isLight = function () {
		return light;
	};
	this.getName = function () {
		return pname;
	};
	this.isHuman = function () {
		return human === "human" || human === true;
	};
	this.getScore = function() {
		return score;
	};
	this.computeScore = function(board) {
		var pieces = board.getAllPieces();
		var sum = 0
		for (var x in pieces) {
			if (pieces[x].isLight() === this.isLight()) { sum += 1; }
		}
		score = sum;
		return score;
	};
	this.makeBestMove = function (board) {		
		//Only a computer player can use this function
		if (!this.isHuman()) {
			var allMoves = board.getAllValidMoves(this);
			
			if (allMoves.length == 0) {
				return false;
			}
		
			var maxPiecesCaptured = 0;
			var bestMove = allMoves[0];
		
			for (var i in allMoves) {
				var score = allMoves[i].piecesCaptured;
				var isCornerPiece = function (x,y) {
					return x === 0 && y === 0 || 
					x === 0 && y === 7 || 
					x === 7 && y === 0 || 
					x === 7 && y === 7;
				}(allMoves[i].x,allMoves[i].y);
			
				var isEdgePiece = function (x,y) {
					return x === 0 || y === 0 || 
					x === 7 || y === 7;
				}(allMoves[i].x,allMoves[i].y);
			
				if (isEdgePiece) { score += 2 }
				if (isCornerPiece) { score += 3 }
				if (maxPiecesCaptured < score) { 
					maxPiecesCaptured = score; 
					bestMove = allMoves[i];
				}
			}
			return board.placePiece(bestMove.x,bestMove.y,this);
		}
		return false;
	};
	
	
	this.toString = this.getName;
};


var Board = function() {
	var board = [];

	for (var i = 0; i < 8; i++) {
		board[i] = [];
		for (var j = 0; j < 8; j++) {
			var startPiece = undefined;
			if ((i === 4 && j === 4) || (i === 3 && j === 3)) {
				startPiece = new Piece(i,j,true);
			} else if ((i === 4 && j === 3) || (i === 3 && j === 4)) {
				startPiece = new Piece(i,j,false);
			}
			board[i][j] = {
				piece : startPiece
			}
		}
	}
	
	this.getBoard = function () {
		return board;
	};
	
	this.getAllPieces = function () {
		var pieces = [];
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				if (typeof board[i][j].piece !== "undefined") {
					pieces.push(board[i][j].piece);
				}
			}
		}
		return pieces;
	};
	
	this.placePiece = function (i,j,player) {
		var captured =  this.isValidMove(i,j,player);
		for (var k in captured) {
			var x = captured[k].x;
			var y = captured[k].y;
			board[x][y].piece.changeColor();
		}
		if (captured.length > 0) {
			board[i][j].piece = new Piece(i,j,player.isLight());
			return true;
		}
		return false;
	};
	
	this.isValidMove = function (i,j,player) {
		//for each adjacent cell, first must be occupied by opposing piece.
		//If that satisfied, in that same line there must be filled with pieces
		//until get to another of your own pieces
		if (typeof board[i][j].piece !== "undefined") { 
			console.log("Cell already occupied. Piece is " + (board[i][j].piece.isLight() ? "light":"dark"));
			return false; 
		}
		var light = player.isLight();
		var captured = [];
		if (i > 0) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x > 0 && board[--x][y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};	
		} 
		if (i <= 7) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x < 7 && board[++x][y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (j > 0) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (y > 0 && board[x][--y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (j <= 7) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (y < 7 && board[x][++y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (i > 0 && j > 0) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x > 0 && y > 0 && board[--x][--y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (i <= 7 && j > 0) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x < 7 && y > 0 && board[++x][--y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (i > 0 && j <= 7) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x > 0 && y < 7 && board[--x][++y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		if (i <= 7 && j <= 7) {
			var x = i;
			var y = j;
			var count = 0;
			var tempCaptured = [];
			while (x < 7 && y < 7 && board[++x][++y].piece && board[x][y].piece.isLight() !== light) {
				tempCaptured.push(board[x][y].piece);
				count++;
			};
			if (count > 0 && board[x][y].piece && board[x][y].piece.isLight() === light) {
				for (var piece in tempCaptured) {
					captured.push(tempCaptured[piece]);
				}
			};
		}
		return captured;
	};
	
	this.getAllValidMoves = function (player) {
		var validMoves = [];
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				var captured;
				if (typeof board[i][j].piece === "undefined" && (captured = this.isValidMove(i,j,player)).length > 0) {
					validMoves.push({ x:i, y:j, piecesCaptured:captured });
				}
			}
		}
		
		return validMoves;
	};
	
	this.copyBoardState = function () {
		var newBoard = new Board();
		var piece = undefined;
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				if (typeof board[i][j].piece !== "undefined") {
					newBoard.getBoard()[i][j].piece = new Piece(i,j,board[i][j].piece.isLight());
				} else {
					newBoard.getBoard()[i][j].piece = undefined;
				}
			}
		}
		
		return newBoard;
	};
	
	this.toString = function () {
		var str = "";
		for (var i = 0; i < 8; i++) {
			str += "|"
			for (var j = 0; j < 8; j++) {
				if (typeof board[i][j].piece !== "undefined") {
					str += board[i][j].piece.isLight() ? "light|" : "dark |";
				} else {
					str += "     |";
				}
			}
			str += "\n";
		} 
		return str;
	};
	
};

var Game = function (p1,p2) {
	var board = new Board();
	var currentPlayer = p1;
	
	var undoBoard = board.copyBoardState();
	var redoBoard = board.copyBoardState();
	
	var currentValidMoves = board.getAllValidMoves(currentPlayer);
	var inProgress = true;
	
	var canUndo = false;
	var canRedo = false;
	
	this.canUndo = function () {
		return canUndo;
	}
	
	this.canRedo = function () {
		return canRedo;
	}
		
	this.getBoard = function () {
		return board;
	};
	
	this.getUndoBoard = function () {
		return undoBoard;
	};
	
	this.getRedoBoard = function () {
		return redoBoard;
	};
	
	this.getP1 = function () {
		return p1;
	}
	
	this.getP2 = function () {
		return p2;
	}
	
	this.getCurrentPlayer = function () {
		return currentPlayer;
	};
	
	this.changeTurn = function () {
		currentPlayer === p1 ? currentPlayer = p2 : currentPlayer = p1;
		currentValidMoves = board.getAllValidMoves(currentPlayer);
		if (!currentPlayer.isHuman()) {
			currentPlayer.makeBestMove(board);
			this.changeTurn();
		}
		return this.getCurrentPlayer();
	};
	
	this.makeMove = function (x,y) {
		var temp = board.copyBoardState();
		if (board.placePiece(x,y,this.getCurrentPlayer())) {
			if (currentPlayer.isHuman()) {
				//Passes over computer player's move for undo and redo
				undoBoard = temp;
				redoBoard = board.copyBoardState();
				canUndo = true;
				canRedo = false;
			}
			this.changeTurn();
			return true;
		}
		return false;
	};
	
	this.undoMove = function () {
		if (canUndo) {
			redoBoard = board.copyBoardState();
			board = undoBoard.copyBoardState();
			if (p1.isHuman() && p2.isHuman()) {
				this.changeTurn();
			} else {
				currentValidMoves = board.getAllValidMoves(currentPlayer);
			}	
			canUndo = false;
			canRedo = true;
			return true;
		}	
		return false;
	};
	
	this.redoMove = function () {
		if (canRedo) {
			undoBoard = board.copyBoardState();
			board = redoBoard.copyBoardState();
			if (p1.isHuman() && p2.isHuman()) {
				this.changeTurn();
			} else {
				currentValidMoves = board.getAllValidMoves(currentPlayer);
			}
			canRedo = false;
			canUndo = true;
			return true;
		}
		return false;
	};
	
	this.getCurrentValidMoves = function () {
		return currentValidMoves;
	};
	
	this.isInProgress = function () {
		return inProgress;
	};
	
	this.isGameOver = function () {
		if (!this.isInProgress()) { return true; }
		else if (board.getAllValidMoves(p1).length === 0 && board.getAllValidMoves(p2).length === 0) {
			inProgress = false;
			return true;
		}
		return false;
	};
	
	this.getP1Score = function () { return p1.computeScore(board) };
	this.getP2Score = function () { return p2.computeScore(board) };
		
	this.getLeader = function () {
		var leader;
		p1Score = p1.computeScore(board);
		p2Score = p2.computeScore(board);
		if (p1Score === p2Score) {
			return "Draw";
		} else {
			return p1Score > p2Score ? p1 : p2;
		}
	};

};