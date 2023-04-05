(function () {
    const Answers = {
        quiz: null,
        answer: null,
        currentQuestionIndex: 1,
        allQuestions: null,
        userData: null,
        preTitle: null,

        init() {
            checkUserData();
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            const name = url.searchParams.get('name');
            const lastName = url.searchParams.get('lastName');
            const email = url.searchParams.get('email');

            if (testId && name && lastName && email) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.site/get-quiz?id=' + testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html'
                    }
                    this.preTitle = document.getElementById('pre-title').innerHTML = this.quiz.name;
                    this.userData = document.getElementById('user-data').innerHTML = name + ' ' + lastName + ', ' + email;
                    this.startQuestions();

                } else {
                    location.href = 'index.html'
                }

            } else {
                location.href = 'index.html';

            }
        },

        startQuestions() {
            console.log(this.quiz)
            this.allQuestions = document.getElementById('all-questions');

            this.showQuestion()
        },

        getAnswers() {
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.site/get-quiz-right?id=' + testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.answer = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html'
                }
                this.checkAnswers();
            } else {
                location.href = 'index.html'
            }
        },

        showQuestion() {
            let questionsArr = this.quiz.questions;

            questionsArr.forEach((item, index) => {

                const titleElement = document.createElement('div');
                titleElement.className = 'question-title';
                titleElement.innerHTML = '<span>Вопрос ' + [index + 1] + ':</span> ' + item.question;

                let optionsAnswers = item.answers;

                const optionsGroup = document.createElement('div');
                optionsGroup.className = 'answer-options'
                optionsGroup.appendChild(titleElement);

                for (let r = 0; r < optionsAnswers.length; r++) {

                    let opt = optionsAnswers[r];
                    const answerElement = document.createElement('div');
                    answerElement.className = 'answer-option';

                    const inputId = 'answer-' + opt.id;

                    const inputElement = document.createElement('input');

                    inputElement.setAttribute('id', inputId);
                    inputElement.setAttribute('type', 'radio');
                    inputElement.setAttribute('name', 'answer');
                    inputElement.setAttribute('value', opt.id);

                    const labelElement = document.createElement('label');
                    labelElement.setAttribute('for', inputId);
                    labelElement.innerText = opt.answer;

                    answerElement.appendChild(inputElement);
                    answerElement.appendChild(labelElement);

                    optionsGroup.appendChild(answerElement);

                    console.log(opt)
                }

                this.allQuestions.appendChild(optionsGroup);
            })
            this.getAnswers();

        },

        checkAnswers() {
            const url = new URL(location.href);
            let userAnswers = url.searchParams.get('answers').split(",");
            userAnswers = userAnswers.map(Number);

            console.log(userAnswers)
            console.log(this.answer)

            for (let i = 0; i < this.answer.length; i++) {

                if(!userAnswers[i]) {
                    const errorBlock = document.createElement('div');
                    errorBlock.innerText = 'Тут пользователь ничего не выбрал';
                    errorBlock.style.color = '#DC3333';

                    document.getElementById('answer-' + this.answer[i]).parentNode.parentNode.appendChild((errorBlock));
                    continue;
                }

                if (this.answer[i] === userAnswers[i]) {
                    document.getElementById('answer-' + this.answer[i]).parentNode.style.color = '#5FDC33';
                    document.getElementById('answer-' + this.answer[i]).style.borderColor = '#5FDC33';
                    document.getElementById('answer-' + this.answer[i]).style.borderWidth= '6px';
                }

                else {
                    document.getElementById('answer-' + userAnswers[i]).parentNode.style.color = '#DC3333';
                    document.getElementById('answer-' + userAnswers[i]).style.borderColor = '#DC3333';
                    document.getElementById('answer-' + userAnswers[i]).style.borderWidth= '6px';
                }
            }

            this.comeBack();
        },

        comeBack() {
           const back = document.getElementById('back');

           back.addEventListener('click', () => {

               location.href = 'result.html' + location.search;
           })
    }
    }

    Answers.init();
})();

