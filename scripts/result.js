(function () {
    const Result = {

        init() {
            const url = new URL(location.href);  // мы должны распарсить результат
            document.getElementById('result-score').innerText = url.searchParams.get('score') + '/' + url.searchParams.get('total');
            const show = document.getElementById('show-answers');
            show.addEventListener('click', function() {
                location.href = 'answers.html' + location.search;
            })
        }

    }

    Result.init();
})();