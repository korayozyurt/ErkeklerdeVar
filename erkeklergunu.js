let loggedIn = localStorage.getItem('login');
if(!loggedIn || loggedIn !== 'parked') {
    window.location.href = '/';
}