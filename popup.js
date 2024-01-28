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
          checkAnswer(quizJson.quiz[index-1].correctIndex);
        });
      } else {
        console.log("Submit Button not found");
      }

      let nextQuestionButton = document.getElementById("nextButton");
      if(nextQuestionButton) {
        nextQuestionButton.addEventListener("click", function () {
          nextQuestion(quizJson);
        });
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
}

function quizScreen(callback) {
  var quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  var quizHtml = `
      <h1>BeatCode LeetCode Quiz</h1>
      <div class="question">
        <h1 id="question"></h1>
      </div>
      <div class="options">
        <span>
            <input
            type="radio"
            id="option-one"
            name="option"
            class="radio"
            value="0"
            />
            <label for="option-one" class="option" id="option-one-label"
            ></label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-two"
            name="option"
            class="radio"
            value="1"
            />
            <label for="option-two" class="option" id="option-two-label"
            ></label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-three"
            name="option"
            class="radio"
            value="2"
            />
            <label for="option-three" class="option" id="option-three-label"
            ></label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-four"
            name="option"
            class="radio"
            value="3"
            />
            <label for="option-four" class="option" id="option-four-label"
            ></label
            >
        </span>

      </div>
      <div class="buttons">
        <button id="submitButton">Submit</button>
        <button id="nextButton">Next Question></button>
      </div>

      <div id="result"></div>
      <div id="score"> Correct: ${correctAnswers} | Wrong: ${incorrectAnswers}</div>
      <div id="selectedOption"></div>
    `;

  quizContainer.innerHTML = quizHtml;

  if (callback && typeof callback === "function") {
    callback();
  }
}

function showLoadingScreen() {
  let quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '<div class="loading">Generating Questions...</div>';
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