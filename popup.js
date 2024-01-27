document.addEventListener('DOMContentLoaded', function () {
    var generateButton = document.getElementById('generateQuiz');
    var pastQuestionsButton = document.getElementById('pastQuestions');
    
    // button click event handlers

    function quizScreen(){
        window.location.href = 'quiz.html';
    }

    generateButton.addEventListener('click', function () {
        // switch screens
        quizScreen();
    });

    generateButton.addEventListener('click', function () {
      // code to generate quiz
      //fetch("http://backend/question");
      console.log('generating quiz questions...');
    });
  
    pastQuestionsButton.addEventListener('click', function () {
      // code to find past quizzez
      //fetch("http://backend/question");
      console.log('Accessing past quiz questions...');
    });
  });