function Main() {
  this.util = null;
  this.wrap = null;
  this.articles = null;
  this.grid = null;
  this.nav = null;
  this.add = null;
  this.write = null;

  this.queryCur = '';
  this.queryPrev = '';
  this.queryPrevAdd = '';
  this.articlesDisplayed = 0;
  var parent = this;

  this.install = function () {
    seer.note('load all js files');

    this.util = new Util();
    this.wrap = new Wrap();
    this.grid = new Grid();
    this.zen = new Zen();

    this.grid.install(
      document.querySelector('main'),
      document.querySelector('.page-overlay'),
      'main',
      'article');
    this.nav = new Nav();
    this.nav.install(document.querySelector('nav'));

    if (window.showAdd !== undefined && window.showAdd) {
      this.add = new Add();
      this.add.install();
      // var escape = document.getElementById("escape");
      // escape.onclick = function()
      // {
      //   main.add.close();
      // }
    }

    if (SETTINGS.ZENMODEENABLED) {
      this.zen.onToggle();

      document.addEventListener('keydown', (event) => {
        if (event.key === SETTINGS.ZENMODEHOTKEY) {
          this.zen.onToggle();
        }
      });
    }

    seer.note('install main');
  }

  this.start = function () {
    this.articles = this.wrap.start(DATABASE);
    seer.note('process db');

    let stats = this.wrap.stats(this.articles);
    seer.note('calc stats');
    this.nav.display(stats);
    seer.note('render stats');

    this.load();
  }

  this.load = function () {
    const activeElement = document.activeElement;

    // RESET
    lightbox.close();

    // Only blur if the active element isn't our search bar
    if (activeElement !== main.zen.searchBar) {
      document.activeElement.blur();
    }

    // UPDATE QUERY
    let target = window.document.location.hash;
    if (this.queryCur !== 'add') {
      this.queryPrev = this.queryCur;
    }
    target = target.substr(0, 1) === "#" ? target.substr(1, target.length - 1) : target;
    this.queryCur = target.trim();
    if (window.location.hash != this.queryCur) {
      window.location.hash = this.queryCur;
    }

    // DISPLAY
    let filtered = main.wrap.filter(main.queryCur, main.articles);
    let filteredLength = Object.keys(filtered).length;
    seer.note('filter db');

    let delay = 0;
    if (filteredLength > SETTINGS.LOADANIMNUM || this.articlesDisplayed > SETTINGS.LOADANIMNUM) {
      // adding or removing a large number of articles can take time, so show loader
      this.grid.clear();
      document.querySelector('.loading-wave').style.display = 'inline-block';
      delay = 10; // Small delay gives the preloader time to display
    }
    this.articlesDisplayed = filteredLength;

    setTimeout(function () { main.build(filtered) }, delay);

    // Restore focus to search bar if it was focused before
    if (activeElement === main.zen.searchBar) {
      setTimeout(() => {
        main.zen.searchBar.focus();
        // Move cursor to end of text
        main.zen.searchBar.selectionStart = main.zen.searchBar.selectionEnd = main.zen.searchBar.value.length;
      }, 0);
    }
  };

  this.build = function (filtered) {
    let html = main.grid.buildAllArticles(filtered)
    seer.note('build html');

    main.grid.display(html);
    seer.report();

    document.querySelector('.loading-wave').style.display = 'none';
  }
}

window.addEventListener("hashchange", function () { main.load(); });