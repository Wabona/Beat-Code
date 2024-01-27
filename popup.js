document.addEventListener('DOMContentLoaded', function () {
  var generateButton = document.getElementById('generateQuiz');
  var pastQuestionsButton = document.getElementById('pastQuestions');

  // letting background script know popup opened
  chrome.runtime.sendMessage({ action: "popupOpened" });


  // button click event handlers

  function quizScreen() {
    window.location.href = 'quiz.html';
  }

  // checking the answer for the quiz
  function checkAnswer() {

  }

  generateButton.addEventListener('click', function () {
    // send message to background.js script to take screenshot of webpage and generate questions
    chrome.runtime.sendMessage({action: "takeScreenshot"}, function(response){
      console.log("Received response: ", response);
    });

    chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
      if (message.action === "serverResponse") {
          console.log("Response from server:", message.data);
      }
    });

    // switch screens
    //quizScreen();

    console.log('generating quiz questions...');

  });

    
    // generateButton.addEventListener('click', function () {
    //   // code to generate quiz
    //   //fetch("http://backend/question");
    //   console.log('generating quiz questions...');
    // });
  
    function pastQuizScreen(){
      window.location.href = "pastquiz.html";
    }
    pastQuestionsButton.addEventListener('click', function () {
      // code to find past quizzez
      //fetch("http://backend/question");
      pastQuizScreen();
      console.log('Accessing past quiz questions...');
    });
  });