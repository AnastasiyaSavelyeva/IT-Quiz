function checkUserData() {
    const url = new URL(location.href);
    const name = url.searchParams.get('name');
    const lastName = url.searchParams.get('lastName');
    const email= url.searchParams.get('email');

    if(!name || !lastName || !email) {
        location.href = 'index.html'
    }
}

