(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var nav = header.querySelector('.dr-nav');
  if (!nav) return;

  var toggle = nav.querySelector('.dr-nav-toggle');
  var navList = nav.querySelector('.dr-nav-list');

  if (!toggle || !navList) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');

    var container = header.querySelector('.dr-header-main');
    if (!container) return;

    if (expanded) {
      container.classList.remove('dr-nav-open');
    } else {
      container.classList.add('dr-nav-open');
    }
  });
})();
