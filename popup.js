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
      let currentTab = tabs[0];
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

        console.log(quizQuestions);
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

        generateButton.innerHTML = "Tab must be on leetcode.com"
        setTimeout(function () {
          generateButton.innerHTML = "Generate Quiz Questions";
        }, 1700);
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
  console.log("Current index", index);
  if (index >= quizJson.quiz.length) {
    console.log("END OF QUIZ");
    endOfQuiz();
  }
}

function quizScreen(callback) {
  let quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  let quizHtml = `
  <div class="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
  <div class="bg-gray-800 rounded-lg p-6 text-white w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6">BeatCode Quiz</h1>
    <div class="font-bold mb-6 text-left" id="question"></div>
    <form class="flex flex-col gap-4 mb-8 w-full">
      <label class="inline-flex items-center">
        <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="0" name="option" />
        <span id="option-one-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
        <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="1" name="option" />
        <span id="option-two-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
        <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="2" name="option" />
        <span id="option-three-label" class="ml-2"></span>
      </label>
      <label class="inline-flex items-center">
        <input class="form-radio bg-gray-700 hover:bg-gray-600 text-white" type="radio" value="3" name="option" />
        <span id="option-four-label" class="ml-2"></span>
      </label>
    </form>
    <div class="flex space-x-4 justify-center w-full">
      <button id="submitButton" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 bg-blue-600 hover:bg-blue-500">
        Submit
      </button>
      <button id="nextButton" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 bg-green-600 hover:bg-green-500">
        Next
      </button>
    </div>
    <br>
    <div class="mt-6 flex justify-center space-x-2 text-sm font-medium text-gray-600">
      <div class="ml-2" id="score"> Correct: ${correctAnswers} | Wrong: ${incorrectAnswers}</div>
      <div class="ml-2" id="selectedOption"></div>
    </div>
    <div class="mt-6 flex justify-center space-x-2 text-sm font-medium text-gray-600" id="result"></div>
  </div>
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

function endOfQuiz() {
  let quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = '<div class ="text-white"> Quiz Completed </div>';

  const scoreContainer = document.createElement("div");
  scoreContainer.className = "mt-6 flex justify-center space-x-2 text-sm font-medium text-white pb-5";
  scoreContainer.innerHTML = `<div class="ml-2"> Correct: ${correctAnswers} | Wrong: ${incorrectAnswers}</div>`;

  const resetButton = document.createElement("button");
  resetButton.className = ""

  resetButton.addEventListener("click", function () {
    quizJson();
    //reset quiz state
    correctAnswers = 0;
    incorrectAnswers = 0;
    index = 0;
  });

  quizContainer.appendChild(scoreContainer);
  quizContainer.appendChild(resetButton);
}