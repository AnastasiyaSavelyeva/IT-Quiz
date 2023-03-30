'use strict';

(function() {
    const Choice = {
        quizzes: [],
        init() {
           checkUserData();

           const xhr = new XMLHttpRequest();
           xhr.open('GET', 'https://testologia.site/get-quizzes', false);
           xhr.send();

           if(xhr.status === 200 && xhr.responseText) {
               try {
                   this.quizzes = JSON.parse(xhr.responseText)
               } catch(e) {
                   location.href = 'index.html'
               }
               this.processQuizzes();
           } else {
               location.href = 'index.html'
           }
        },

        processQuizzes() { //создаем структуру HTML, тк с бэка могут приходить разное количество тестов, затем удаляем эти блоки в верстке
            const choiceOptionsElement = document.getElementById('choice-options');

            if(this.quizzes && this.quizzes.length > 0) {
                this.quizzes.forEach(quiz => {
                    const that = this;
                    const choiceOptionElement = document.createElement('div');
                    choiceOptionElement.className = 'choice-option';
                    choiceOptionElement.setAttribute('data-id', quiz.id)
                    choiceOptionElement.onclick = function () {
                        that.chooseQuiz(this);
                    }

                    const choiceOptionTextElement = document.createElement('div');
                    choiceOptionTextElement.className = 'choice-option-text';
                    choiceOptionTextElement.innerText = quiz.name;

                    const choiceOptionArrowElement = document.createElement('div');
                    choiceOptionArrowElement.className = 'choice-option-arrow';

                    const choiceOptionImageElement = document.createElement('img');
                    choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                    choiceOptionImageElement.setAttribute('alt', 'arrow');

                    choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                    choiceOptionElement.appendChild(choiceOptionTextElement);
                    choiceOptionElement.appendChild(choiceOptionArrowElement);
                    choiceOptionsElement.appendChild(choiceOptionElement);
                })
            }
        },

        chooseQuiz(element) {  //определяем по id выбор пользователя
            const dataId = element.getAttribute('data-id');

            if(dataId) {
                location.href = 'test.html' + location.search + '&id=' + dataId;
            }
        }
    }
    Choice.init();
})();