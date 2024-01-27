document.addEventListener('DOMContentLoaded', function () {
    var generateButton = document.getElementById('generateQuiz');
    var pastQuestionsButton = document.getElementById('pastQuestions');
    
    // button click event handlers

    generateButton.addEventListener('click', function () {
      // code to generate quiz
      fetch("http://backend/question");
      console.log('generating quiz questions...');
    });
  
    pastQuestionsButton.addEventListener('click', function () {
      // code to find past quizzez
      console.log('Accessing past quiz questions...');
    });
  });