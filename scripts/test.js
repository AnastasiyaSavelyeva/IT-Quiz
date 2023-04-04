(function () {
    const Test = {
        quiz: null, //7.создаем переменную,куда будем помещать пришедшие с сервера данные
        questionTitleElement: null, //17. создаем свойство со значением null
        questionOptionsElement: null, //20. создаем свойство со значением null
        nextButtonElement: null, //28. создаем свойство со значением null
        prevButtonElement: null, //29. создаем свойство со значением null
        passButtonElement: null, //34. создаем свойство со значением null
        progressBarElement: null, //55. создаем свойство со значением null
        currentQuestionIndex: 1,  //13. создаем переменную,со значением 1,тк в любом случае при загрузке теста начинаем с 1 вопроса
        userResult: [], //41. создаем массив, куда будем сохранять выбранные пользователем ответы
        passLinkElement: null,

        init() {
            checkUserData();  //1. проверяем данные пользователя в строке url
            const url = new URL(location.href);
            const testId = url.searchParams.get('id'); //2. также надо получить id, которое соответствует номеру теста

            if (testId) {   //3. если параметр существует, то выполняем код
                const xhr = new XMLHttpRequest();       //5. запрашиваем с сервера все данные об этом тесте
                xhr.open('GET', 'https://testologia.site/get-quiz?id=' + testId, false);
                xhr.send();

                if (xhr.status === 200 && xhr.responseText) {  //6. делаем проверку
                    try {
                        this.quiz = JSON.parse(xhr.responseText);   //8.берем данные, пришедшие с сервера и помещаем их в переменную
                    } catch (e) {
                        location.href = 'index.html'
                    }
                    this.startQuiz();        //9.если проверка соответствует условию, начинает тест

                } else {
                    location.href = 'index.html'
                }

            } else {   //4. если не существует - отправляем на главную страницу
                location.href = 'index.html';
            }
        },

        startQuiz() {                   //10. создаем функцию начала теста
            /* console.log(this.quiz)  */  //11. смотрим в консоли структуру данных, пришедших с сервера
            this.questionTitleElement = document.getElementById('title'); //16. создаем переменную для текста вопроса
            this.optionsElement = document.getElementById('options'); //19.создаем переменную
            this.progressBarElement = document.getElementById('progress-bar')  //54. создаем пременную
            this.nextButtonElement = document.getElementById('next'); //26. находим кнопку некст
            this.nextButtonElement.onclick = this.move.bind(this, 'next')   //33. вешаем обработчик события на кнопку, а чтобы контекст не потерялся. добавляем bind и next
            this.passButtonElement = document.getElementById('pass'); //34. находим кнопку pass
            this.passButtonElement.onclick = this.move.bind(this, 'pass')   //36. вешаем обработчик события на кнопку, а чтобы контекст не потерялся. добавляем bind и pass
            this.prevButtonElement = document.getElementById('prev'); //27. находим кнопку превьюс
            this.prevButtonElement.onclick = this.move.bind(this, 'prev'); //37. вешаем обработчик события на кнопку, а чтобы контекст не потерялся. добавляем bind и prev
            document.getElementById('pre-title').innerText = this.quiz.name; //51. находим и отображаем название текущего уровня теста на странице
            this.passLinkElement = document.getElementById('passQuestion');

            this.prepareProgress();    //52
            this.showQuestion();          //14. вводим ф-ю д/отображения вопроса

            //58. Устанавливаем таймер
            const timerElement = document.getElementById('timer')
            let seconds = 59;

            const interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;
                if (seconds === 0) {
                    clearInterval(interval);
                    this.complete();
                }
            }.bind(this), 1000)
        },

        prepareProgress() {  //52. Подготавливаем прогресс-бар
            for (let i = 0; i < this.quiz.questions.length; i++) {  //53. проходимся циклом, чтобы не устанавливать ограниченное кол-во вопросов
                const itemElement = document.createElement('div');   //создаем DOM-элементы
                itemElement.className = 'progress-bar-item ' + (i === 0 ? 'active' : ''); //используем тернарный оператор, если это первый вопрос, то дополнительно добавится класс active

                const itemCircleElement = document.createElement('div');
                itemCircleElement.className = 'progress-bar-item-circle';

                const itemTextElement = document.createElement('div');
                itemTextElement.className = 'progress-bar-item-text';
                itemTextElement.innerHTML = 'Вопрос ' + (i + 1);

                itemElement.appendChild(itemCircleElement);
                itemElement.appendChild(itemTextElement);
                this.progressBarElement.appendChild(itemElement);

            }
        },

        showQuestion() {      //12. создаем универсальную ф-ю, к-я будет показывать - на каком вопросе мы находимся
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];      //15. вносим текущий вопрос в переменную (в массиве первый элемент - активный, т.е.[0]
            this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> ' + activeQuestion.question;  //18. вносим текст вопроса, подставляя код и переменные, затем проверяем на странице отображение вопроса

            this.optionsElement.innerHTML = ''; //21. очищаем полностью все вопросы,чтобы они удалялись на следующем вопросе (это всегда надо делать)
            const that = this;   //24. тк у нас теряется контекст при создании функции выбора варианта ответа, то создаем переменную
            const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id)   //48. создаем прееменную, в которой будем искать ответ для текущего вопроса (для отображения выбранного radio)
            activeQuestion.answers.forEach(answer => {  //22. создаем DOM-элементы, затем удаляем их в верстке
                const optionElement = document.createElement('div');
                optionElement.className = 'test-question-option';
                const inputId = 'answer-' + answer.id;  //23. создаем переменную, чтобы максимально оградить себя от ошибок
                const inputElement = document.createElement('input');

                inputElement.className = 'option-answer';    //42. добавляем класс инрутам с вариантами для дальнейшего сохранения выбранного ответа
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('value', answer.id);
                if (chosenOption && chosenOption.chosenAnswerId === answer.id) {     //49. проверяем, если инпут соответствует выбранному ользователем, то устанавливаем выбранный. т.о. при возврате на предыдущий вопрос выбранный инпут сохранится
                    inputElement.setAttribute('checked', 'checked')
                }
                inputElement.onchange = function () {   //25. создаем событие при выборе варианта ответа
                    that.chooseAnswer();
                };
                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);
                this.optionsElement.appendChild(optionElement)
            });

            this.passLinkElement.classList.remove('disabled');

            if (chosenOption && chosenOption.chosenAnswerId) { //50. чтобы кнопка была снова активной при перемещении по страницам с выбранным вариантом ответов, создаем условие

                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled'); //38. делаем кнопку неактивной при каждом новом появлении вопроса
            }

            if (this.currentQuestionIndex === this.quiz.questions.length) {  //39. когда мы дошли до последнего вопроса - меняем текс кнопки на завершить
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled') //40. делаем кнопку назад активной, кроме 1 вопроса
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled')
            }
        },

        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled'); //30. делаем кнопку активной после выбора варианта ответа
            this.passLinkElement.classList.add('disabled');
        },

        move(action) {  //31. создаем универсальную ф-ю, которая будет делать действие, когда мы переходим на следующую.предыдущую страницу, чтобы отобразить следующий вопрос (переменная action будет обозначать действие вперед, надаж или пропустить)
            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {  //43. проходимся по инпутам и ищем с выбранным значением checked, но тк мы с помощью find получаем коллекцию, то мы переводим ее в массив с помощью Array.from()
                return element.checked;
            });
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];  //45. копируем и переносим из другой функции

            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {   //44. проверяем, если ответ есть, то сохраняем его в переменную
                chosenAnswerId = Number(chosenAnswer.value);
            }
            /*console.log(chosenAnswerId)*/
            const existingResult = this.userResult.find(item => {  //46. проверяем, естб ли в объекте ответ с таким же id, чтобы не нагромождать ответы
                return item.questionId === activeQuestion.id;
            });
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {   //если такого нет, то будем создавать
                this.userResult.push({                    //47. добавляем в массив объект со свойствами
                    questionId: activeQuestion.id,    // привязка к номеру вопроса
                    chosenAnswerId: chosenAnswerId,       // выбранный/пропущенный ответ
                })
            }

           /* console.log(this.userResult)*/

            if (action === 'next' || action === 'pass') {  //31
                this.currentQuestionIndex++;  // переход на след страницу
            } else {
                this.currentQuestionIndex--;  // преход на предыдущую страницу
            }

            //60. используем доп проверку - если индекс будет больше, чем кол-во вопромов, то мы вызываем ф-ю complete и используем return
            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            //56. проходимся циклом по всем дочерним элементам прогресс-бара и работаем с классами, тк у нас снова возвращается коллекция, используем Array.from()
            Array.from(this.progressBarElement.children).forEach((item, index) => {

                const currentItemIndex = index + 1;   // 57. создаем переменную текущего индекса
                item.classList.remove('complete');
                item.classList.remove('active');

                if (currentItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currentItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete')
                }

            });

            this.showQuestion(); //32. затем мы отображаем вопрос на странице
        },

        complete() {   //59. завершаем тест с учетом выбранных ответов и отпрравляем их на сервер
            const url = new URL(location.href);
            const id = url.searchParams.get('id');
            const name = url.searchParams.get('name');
            const lastName = url.searchParams.get('lastName');
            const email = url.searchParams.get('email');

            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://testologia.site/pass-quiz?id=' + id, false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8') // предаем а формате JSON
            xhr.send(JSON.stringify({
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }))

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;

                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html'
                }
                if (result) {
                    let rightAnswers = [];
                    this.userResult.forEach((right) => {
                        rightAnswers.push(right.chosenAnswerId);
                    })

                   location.href = 'result.html' + location.search + '&answers=' + rightAnswers + '&score='  + result.score + '&total=' + result.total;
                }

            } else {
                location.href = 'index.html'
            }

        }
    }


    Test.init();
})();