
window.addEventListener('scroll', function () {
    document.querySelector('#stickyTop').style.display = 'none';
    var body_width = document.documentElement.clientWidth || document.body.clientWidth;
    var scroll_height = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    if (body_width > 750) {
        if (scroll_height > 10) {
            document.querySelector('#stickyTop').style.display = 'block';

        } else {
            document.querySelector('#stickyTop').style.display = 'none';
        }
    }
});