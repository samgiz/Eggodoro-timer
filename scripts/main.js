var workTime, breakTime, display, title, pauseButton, workButton, breakButton, countdown, work, audioPlaying, timeLeft, workEndAudio, breakEndAudio;
window.onload = () => {
  workTime=25, breakTime=5; // initial times in minutes

  // getting important parts of the clock
  display = document.getElementById("display");
  title = document.getElementById("title");
  pauseButton = document.getElementById("pauseButton");
  workButton = document.getElementById("workButton");
  breakButton = document.getElementById("breakButton");

  // tracks if the clock is in countdown mode
  countdown=false;
  // tracks if clock is in work mode (if it isn't, it is in rest mode)
  work=true;

  // tracks if audio is still playing once time has finished (to freeze the clock until the audio stops playing)
  audioPlaying=false;

  // variables for correct display updates
  timeLeft=minutesToMiliseconds(workTime), lastCheckedTime=0;

  // audio files that play once the time on the clock runs out
  workEndAudio = document.getElementById("workEndAudio");
  breakEndAudio = document.getElementById("breakEndAudio");
}

//Adds a zero at the beginning if time<10
function format(a){
  if(a<10)return "0"+a;
  else return a;
}

//Takes milliseconds and returns it in a "clock" format
function formatTime(a){
  tmp = Math.floor(a/60/1000)+":"+format(Math.floor(a/1000)%60)+":"+format(Math.floor(a/10)%100);
  if(tmp.length==7)tmp="&nbsp"+tmp;
  return tmp;
}

function minutesToMiliseconds(a){
  return a*60*1000;
}

// Changes time of work/rest
// If the button is held down for a second, it starts rapidly increasing/decreasing the time.
// This variable is updated from index.html
var lastPress = 0;
function changeTime(b){
  changeTimeOnce(b);
  function tmp(b, lp){
    if(lp==lastPress){
      changeTimeOnce(b);
      setTimeout(tmp, 100, b, lp);
    }
  }
  setTimeout(tmp, 500, b, lastPress);
}

// Changes time of work/rest once
function changeTimeOnce(b){
  if((b=='1'&&workTime==1)||(b=='2'&&workTime==99)||(b=='3'&&breakTime==1)||(b=='4'&&breakTime===99)) return;
  switch(b){
    case '1':
      workTime--;
      if(work)timeLeft=minutesToMiliseconds(workTime);
      break;
    case '2':
      workTime++;
      if(work)timeLeft=minutesToMiliseconds(workTime);
      break;
    case '3':
      breakTime--;
      if(!work)timeLeft=minutesToMiliseconds(breakTime);
      break;
    case '4':
      breakTime++;
      if(!work)timeLeft=minutesToMiliseconds(breakTime);
      break;
  }
  workButton.innerHTML="Work: "+workTime+" min";
  breakButton.innerHTML="Rest: "+breakTime+" min";
  updateDisplay();
}

// Changes whether the clock is running. Can be called by the play/pause button.
function changeState(){
  countdown=!countdown;
  if(countdown) lastCheckedTime = new Date().getTime();
  updateCountdown();
  updateText();
}

// Sets the time left for clock to tick
function updateTime(){
  var date = new Date();
  var time = date.getTime();
  timeLeft-=(time-lastCheckedTime);
  lastCheckedTime=time;
}

//Updates display screen with the time left for work/rest
function updateDisplay(){
  if(timeLeft<0)display.innerHTML="0:00:00";
  else display.innerHTML=formatTime(timeLeft);
}

function updateText(){
  if(audioPlaying)return;
  
  // Make sure the pause button shows the correct sign
  if(countdown){
    pauseButton.innerHTML="<i class=\"fa fa-pause\"></i>";
    pauseButton.style.paddingRight="5px";
  }
  else {
    pauseButton.innerHTML="&nbsp<i class=\"fa fa-play\"></i>";
    pauseButton.style.paddingRight="10px";
  }
  
  // Make sure the correct button is pressed down 
  if(work){
    workButton.style.borderStyle="inset";
    breakButton.style.borderStyle="none";
    title.innerHTML="Work time left:";
  }
  else{
    workButton.style.borderStyle="none";
    breakButton.style.borderStyle="inset";
    title.innerHTML="Rest time left:";
  }
}

// Makes sure the elements of the clock are up to date
function updateCountdown(){
  // Don't change anything if the time has just finished
  if(audioPlaying)return;
  
  // If clock is running, reduce remaining time
  if(countdown){
    updateTime();
    // TIme reached 0, time to inform the user
    if(timeLeft<0){
      if(!audioPlaying){
        if(work)workEndAudio.play();
        else breakEndAudio.play();
        audioPlaying=true;
      }
    }
    // Call this function again as soon as possible to update display
    setTimeout(updateCountdown, 0);
  }
  // Make sure the display is up to date after any changes
  updateDisplay();
}

// Resets clock to its initial state, stopping it.
function resetClock(resetCountdown){
  if(work) timeLeft = minutesToMiliseconds(workTime);
  else timeLeft = minutesToMiliseconds(breakTime);
  lastCheckedTime = new Date().getTime();
  if(resetCountdown)countdown=false;
  updateCountdown();
}

// Changes from break time to work time or vice versa, if needed (after one of the workOrBreak buttons is pressed)
function changeMode(btn){
  if(btn && btn.id==="workButton" && work)return;
  if(btn && btn.id==="breakButton" && !work)return;
  work=!work;
  resetClock(btn);
  updateText();
}