//global handle to board div and controls div
// so we dont have to look it up every time

let boardNode;
let controlNode;
let infoNode;

let remainingMoves;

//if AI goes first, need to know what players mark is
let playerMark = "X";
let aiMark = "O";

//holds the board buttons in nested arrays
//accessed like board[0][0] (top left button)
const board = [];

//assoc array of the other buttons
//accessed like controls.aiFirst or controls.reload
const controls = {};


//no return or params
//picks an open button and sets it as the AIs mark
//always sets aiFirst button to disabled
const aiGo = () => {
    console.log("AI's turn")

    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            // found an open spot
            if(board[i][j].innerHTML == "_"){
                board[i][j].innerHTML = aiMark
                remainingMoves--

                return
            }
        }
    }
    

}

//return X, O, or - if game is over
//returns false if game isnt over
const checkEnd = () => {

    //check verticals and horizontals
    for(let i = 0; i < 3; i++){
        // checks rows
        if (checkStraight(
                board[0][i], board[1][i], board[2][i] 
            ) == true) {
                console.log("Winner winner")
                return board[0][i].innerHTML
            }
        // check columns
        else if (checkStraight(
                board[i][0], board[i][1], board[i][2]
            ) == true) {
                console.log("Winner winner")
                return board[i][0].innerHTML
            }   
    }

    // check diagonals
    if (checkStraight(
        board[0][0], board[1][1], board[2][2]
    ) == true) {
        console.log("Winner winner")
        return board[0][0].innerHTML
    }
    else if(checkStraight(
        board[2][0], board[1][1], board[0][2]
    ) == true) {
        console.log("Winner winner")
        return board[2][0].innerHTML
    }

    if(checkTie() == true){
        console.log("Tie!")
        return "-"
    }

    return false
}


// returns true if we found a winner, false otherwise
const checkStraight = function(b1, b2, b3){
    
    // we found a winner
    if(b1.innerHTML != "_" && b1.innerHTML == b2.innerHTML && b2.innerHTML == b3.innerHTML){
        return true;
    }
    else {
        return false;
    }
}

// returns true if we found a tie, false otherwise
const checkTie = function(){    
    if(remainingMoves > 0){
        return false
    }

    // no more empty spaces, game over
    return true
}


//always sets aiFirst button to disabled
//sets button state (disabled and inner html)
//checks for end state (and possible ends game)
//calls aiGo
//checks for end state (and possible ends game)
const boardOnClick = function(i, j, event){
    console.log("Clicked ", i, j)
    
    document.getElementById("aiFirst").disabled = true   
    
    // check that nothing is there    
    if(board[i][j].innerHTML == "_"){ 
        board[i][j].innerHTML = playerMark
        console.log("Player X chose: ", i, j)   
        remainingMoves--
    }

    let winner = checkEnd()
    if(winner != false){
        console.log("Ending game...")
        endGame(winner)
        return
    }
    
    aiGo()

    winner = checkEnd()
    if(winner != false){
        console.log("Ending game...")
        endGame(winner)
        return
    }

}

//changes playerMark global, calls aiGo
const aiFirstOnClick = () => {
    console.log("AI first was clicked")
    
    // disable button
    document.getElementById("aiFirst").disabled = true
    
    aiGo()
}

// refreshes the game to an empty board
const refreshGame = () => {
    location.reload()
}

//takes in the return of checkEnd (X,O,-) if checkEnd isnt false
//disables all board buttons, shows message of who won (or cat game) in the control node
//using a new div and innerHTML
const endGame = (state)=>{

    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            board[i][j].disabled = true
        }
    }

    const winner = document.getElementById("winBox")
    
    // tie
    if(state == "-"){
        winner.innerHTML = "Tie!"
    }
    // player won
    else if(state == playerMark){    
        winner.innerHTML = playerMark + " won!"   
    }
    // ai won
    else if(state == aiMark){    
        winner.innerHTML = aiMark + " won!"
    }

}

//called when page finishes loading
//populates the boardNode and controlsNode with getElementById calls
//builds out buttons and saves them in the board global array
//and adds them into the boardNode
//builds out buttons and saves them in control assoc array
//and adds them into controlsNode
//attaches the functions above as button.onclick as appropriate
const load = ()=>{
    boardNode = document.getElementById("board") // pointer to board
    controlNode = document.getElementById("controls") // to keep track of control buttons
    infoNode = document.getElementById("gameInformation") // displays winner, lets you know a space is taken

    remainingMoves = 9

    for(let i = 0; i < 3; i++){
        board[i] = []
        const div = document.createElement("div")
        boardNode.appendChild(div)

        for(let j = 0; j < 3; j++){
            const button = document.createElement("button") 
            button.className = "boardButton"
            button.innerHTML = "_" 

            button.onclick = boardOnClick.bind(null, i, j) 
            board[i][j] = button
            div.appendChild(button)
        }
    }

    // create and append "AI goes first" and "reset" board to control node
    const controlDiv = document.createElement("div")
    controlDiv.className = "control"

    // create button, set text, add to div
    const aiFirstBtn = document.createElement("button")
    aiFirstBtn.innerHTML = "Let AI go first"
    aiFirstBtn.id = "aiFirst"
    aiFirstBtn.onclick = aiFirstOnClick
    controlDiv.appendChild(aiFirstBtn)

    const refreshBtn = document.createElement("button")
    refreshBtn.innerHTML = "Refresh Game"
    refreshBtn.onclick = refreshGame
    controlDiv.appendChild(refreshBtn)

    // add div to HTML 
    controlNode.appendChild(controlDiv)

    // create div for winner info
    const infoDiv = document.createElement("div")
    infoDiv.className = "info"

    const winnerText = document.createElement("h3")
    winnerText.innerText = "Winner:"
    infoDiv.appendChild(winnerText)

    const winBox = document.createElement("h3")
    winBox.id = "winBox"
    infoDiv.appendChild(winBox)
    
    infoNode.appendChild(infoDiv)


}

//this says 'when the page finishes loading call my load function'
window.addEventListener("load", load); 