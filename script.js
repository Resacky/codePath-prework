// global constants
const startingclueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence
const timeLimit = 120;

// function for potentially procederally generating a random pattern
function randomPattern() {
  var randNum;
  var pattern = new Array(8);

  for (let i = 0; i < pattern.length; i++) {
    pattern[i] = Math.floor(Math.random() * 4 + 1);
  }

  return pattern;
}

//Global Variables

var currentClueHoldTime; //to modify the value of the hold time as the game progresses
var timer;
var clock = 0;

var pattern;
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;

function updateClockText() {
  
  var minutes = parseInt(clock/60);
  
  var seconds = clock%60;
  
  var secondsFormatted = seconds.toLocaleString('en-US', {minimumIntegerDigits: 2})
  
document.getElementById("timer").innerHTML = minutes + ":" + secondsFormatted;
  
}

function timerClock() {
  
  clock++;
  
  updateClockText()
  
  if (clock == timeLimit) {

    stopGame();
    alert("Game Over. You ran out of time!");
    
  }
  
}

function startGame() {
  
  clock = 0;
  updateClockText();
  document.getElementById("timer").classList.remove("hidden");
  
  currentClueHoldTime = startingclueHoldTime;
  timer = setInterval(timerClock, 1000);
  
  progress = 0;
  gamePlaying = true;

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");

  pattern = randomPattern();

  playClueSequence();
}

function stopGame() {
  gamePlaying = false;
  clearInterval(timer);

  // swapped the Start and Stop buttons (Start should be shown and stop should be hidden)
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  
  document.getElementById("timer").classList.add("hidden");
  
}

// Sound Synthesis Functions
const freqMap = {
  1: 50,
  2: 80,
  3: 120,
  4: 30,
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

//function for comp to activate the buttons lighting up

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

//function for the clue(s)

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, currentClueHoldTime);
    setTimeout(clearButton, currentClueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += currentClueHoldTime;
    delay += cluePauseTime;
  }
  
  currentClueHoldTime = currentClueHoldTime - 115;

  
}

//function when the user loses the game

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

//function for guesses

function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  if (pattern[guessCounter] == btn) {
    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        winGame();
      } else {
        progress++;
        playClueSequence();
      }
    } else {
      guessCounter++;
    }
  } else {
    loseGame();
  }
}
