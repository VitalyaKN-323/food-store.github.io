const icona = document.querySelector('.searchInput .icona');
const searchinput = document.querySelector('.searchInput');

icona.onclick = function(){
    searchinput.classList.toggle('active');
};
