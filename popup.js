let correctAnswers = 0;
let incorrectAnswers = 0;

document.addEventListener("DOMContentLoaded", function () {
  let generateButton = document.getElementById("generateQuiz");
  let nextQuestionButton = document.getElementById("")
  let pastQuestionsButton = document.getElementById("pastQuestions");

  // letting background script know popup opened
  chrome.runtime.sendMessage({ action: "popupOpened" });

  // handling generate button action
  generateButton.addEventListener("click", async function () {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      var currentTab = tabs[0];
      if (currentTab.url.includes("leetcode.com")) {
        showLoadingScreen();
        console.log("generating quiz questions...");
        // send message to background.js script to take screenshot of webpage and generate questions
        chrome.runtime.sendMessage(
          { action: "takeScreenshot" },
          function (response) {
            console.log("Received response: ", response);
          }
        );

        let quizQuestions = await waitForServerResponse();
        quizQuestions = removeMarkdownCodeBlock(quizQuestions);

        const quizJson = JSON.parse(quizQuestions);

        quizScreen(function () {
          nextQuestion(quizJson);
          let submitButton = document.getElementById("submitButton");
          if (submitButton) {
            submitButton.addEventListener("click", function () {
              checkAnswer(quizJson.quiz[index - 1].correctIndex);
              submitButton.disabled = true;
            });
          } else {
            console.log("Submit Button not found");
          }

          let nextQuestionButton = document.getElementById("nextButton");
          if (nextQuestionButton) {
            nextQuestionButton.addEventListener("click", function () {
              nextQuestion(quizJson);
              submitButton.disabled = false;
            });
          }
        });
      } else {
        console.log("Not on leetcode.com. Quiz not generated.");
      }
    });
  });




  // function pastQuizScreen() {
  //   window.location.href = "pastquiz.html";
  // }
  // pastQuestionsButton.addEventListener("click", function () {
  //   // code to find past quizzez
  //   //fetch("http://backend/question");
  //   pastQuizScreen();
  //   console.log("Accessing past quiz questions...");
  // });
});

function waitForServerResponse() {
  return new Promise((resolve, reject) => {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.action === "serverResponse") {
        resolve(message.data.message.content); // Resolve with the response content
      }
    });
  });
}

let index = 0;
function nextQuestion(quizJson) {
  const currentQuestion = quizJson.quiz[index];
  console.log(quizJson);
  console.log(currentQuestion);
  document.getElementById("question").innerHTML = currentQuestion.question;
  document.getElementById("option-one-label").innerHTML = currentQuestion.answers[0];
  document.getElementById("option-two-label").innerHTML = currentQuestion.answers[1];
  document.getElementById("option-three-label").innerHTML = currentQuestion.answers[2];
  document.getElementById("option-four-label").innerHTML = currentQuestion.answers[3];
  index++;
  if(index == quizJson.quiz.length){
    endOfQuiz();
  }
}

function quizScreen(callback) {
  var quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  var quizHtml = `
  <div class="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white p-4">
  <h1 class="text-2xl font-bold mb-6">BeatCode Quiz</h1>
  <div class="mb-8 text-center" id="question"></div>
  <form class="flex flex-col gap-4 mb-8">
      <label class="inline-flex items-center">
          <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="0" name="option" />
          <span id="option-one-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
          <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="1" name="option" />
          <span id="option-two-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
          <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="2"
              name="option" />
          <span id="option-three-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
          <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="3"
              name="option" />
          <span id="option-four-label" class="ml-2"></span>
      </label>
  </form>

  <div class="flex justify-between mt-8">
  <button id="submitButton" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 bg-blue-600 hover:bg-blue-500">
    Submit
  </button>
  <button id="nextButton" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 bg-green-600 hover:bg-green-500">
    Next Question
  </button>
</div>
<div class="mt-6 flex justify-center space-x-2 text-sm font-medium text-gray-600">
  <div class="ml-2" id="score"> Correct: ${correctAnswers} | Wrong: ${incorrectAnswers}</div>
  <div class="ml-2" id="selectedOption"></div>
</div>
<div class="mt-6 flex justify-center space-x-2 text-sm font-medium text-gray-600" id="result"></div>
</div>
    `;

  quizContainer.innerHTML = quizHtml;

  if (callback && typeof callback === "function") {
    callback();
  }
}

function showLoadingScreen() {
  let quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '<div class="text-white">Generating Questions...</div>';
}

function removeMarkdownCodeBlock(text) {
  const regex = /```.*?\n([\s\S]*?)```/g;

  return text.replace(regex, (match, p1) => p1);
}

function checkAnswer(correctIndex) {
  let option = document.querySelectorAll("input[name='option']");
  let chosenOption;

  option.forEach(function (option) {
    //accessing the checked property of radio button
    if (option.checked) {
      chosenOption = option.value;
    }
  });

  if (chosenOption == correctIndex) {
    document.getElementById("result").innerText = "Correct!";
    correctAnswers++;
  } else {
    document.getElementById("result").innerText = "Incorrect";
    incorrectAnswers++;
  }

  document.getElementById("score").innerText = `Correct: ${correctAnswers} | Wrong: ${incorrectAnswers}`;
}

function endOfQuiz(){
  let quizContainer = document.getElementById("quiz-container").innerHTML = "0";
  // if(correctAnswers <= )
}