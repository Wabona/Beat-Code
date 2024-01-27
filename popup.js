document.addEventListener("DOMContentLoaded", function () {
  var generateButton = document.getElementById("generateQuiz");
  var pastQuestionsButton = document.getElementById("pastQuestions");

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

    let serverResponse = await waitForServerResponse();
    
    console.log("Response from server:", serverResponse);
    quizScreen();
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

function quizScreen() {
  var quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';

  var quizHtml = `
      <h1>BeatCode LeetCode Quiz</h1>
      <div class="question">
        <h1>What type of traversal did you use to search the binary tree?</h1>
      </div>
      <div class="options">
        <span>
            <input
            type="radio"
            id="option-one"
            name="option"
            class="radio"
            value="optionA"
            />
            <label for="option-one" class="option" id="option-one-label"
            >Inorder Traversal</label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-two"
            name="option"
            class="radio"
            value="optionB"
            />
            <label for="option-two" class="option" id="option-two-label"
            >Preorder Traversal</label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-three"
            name="option"
            class="radio"
            value="optionC"
            />
            <label for="option-three" class="option" id="option-three-label"
            >Postorder Traversal</label
            >
        </span>

        <span>
            <input
            type="radio"
            id="option-four"
            name="option"
            class="radio"
            value="optionD"
            />
            <label for="option-four" class="option" id="option-four-label"
            >Boundary Traversal</label
            >
        </span>

      </div>
      <div class="buttons">
        <button>Submit</button>
        <button>Next Question></button>
      </div>

      <div id="result"></div>
    `;

  quizContainer.innerHTML = quizHtml;
}

function showLoadingScreen() {
  let quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '<div class="loading">Generating Questions...</div>';
}

