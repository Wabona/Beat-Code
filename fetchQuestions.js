document.addEventListener('DOMContentLoaded', function () {
    // Fetch quiz.html content
    fetch('quiz.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const quizDocument = parser.parseFromString(html, 'text/html');
            
            // Extract questions from quiz.html
            const questions = quizDocument.querySelectorAll('.question h1');

            // Insert questions into past-quiz.html
            const pastQuizContainer = document.querySelector('.pastquiz-page');
            questions.forEach((question, index) => {
                const pastQuestionContainer = document.createElement('div');
                pastQuestionContainer.classList.add('past-question');
                pastQuestionContainer.innerHTML = `
                    <h2>Question ${index + 1}</h2>
                    <div class="past-options">
                        ${question.innerHTML}
                    </div>
                    <p>Correct Answer: Preorder Traversal</p>
                `;
                pastQuizContainer.appendChild(pastQuestionContainer);
            });
        })
        .catch(error => console.error('Error fetching questions:', error));
});