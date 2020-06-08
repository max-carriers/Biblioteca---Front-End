let selected = "";

function isFree(isbn) {
  let copiesLeft = freeCopiesCount(isbn);
  if (copiesLeft === 0) return false;
  else return true;
}

function getStartDate(isbn) {
  let list = {};
  for (let b in DB.taken) if (log.uuid == b) list = DB.taken[b].list;
  return list[isbn];
}

function freeCopiesCount(isbn) {
  let totalNumber = DB.all[isbn].copies;
  let taken = 0;

  for (let p in DB.taken) {
    for (let b in DB.taken[p].list)
      if (b === isbn) taken++;
  }

  return (totalNumber <= taken) ? (0) : (totalNumber - taken);
}

function amIReading(isbn) {
  let list = [];
  for (let b in DB.taken) if (log.uuid == b) list = DB.taken[b].list;
  for (let b in list) if (b == isbn) return true;
  return false;
}


function prenota() {
  let free = isFree(selected);
  let read = !amIReading(selected);

  if (free && read) {
    prenotaCloud(selected);
  }
}

function rilascia() {
  let isbn = amIReading(selected);
  if (!!isbn) {
    rilasciaCloud(selected);
  }
}

function loadMyBook(isbn) {
  if (!isbn) return;
  if (!amIReading(isbn)) return;

  let book = DB['all'][isbn];
  selected = isbn;
  element('#titLett').innerText = book.title;
  element('#stLett').innerText = book.subtitle;
  element('#autLett').innerText = book.author;
  element('#pagLett').innerText = book.pages;
  element('#dateLett').innerText = getStartDate(isbn);
  element('#dsLett').innerText = book.desc;
  element('#imgLett').src = book.img;
  element('.control.lettura').classList.remove('disabled');
  openInterface(1);

}

function loadMyBooks() {
  if (DB.taken[log.uuid]) {
    let list = element("#letture");
    list.innerHTML = "";
    let llength = 0;
    for (let b in DB.taken[log.uuid].list) {
      llength++;
      let book = DB.all[b];
      let div = document.createElement("div");
      div.innerHTML = `<img src="${book.img}" alt="${book.title}" /><span><span onclick="loadMyBook(${book.isbn})">Visualizza</span></span>`;
      list.appendChild(div);
    }
    
    if (llength > 0) {
      element('.control.lettura').classList.remove('disabled');
      element('.control.lettura').onclick = () => {openInterface(3)}
    } else {
      element('.control.lettura').classList.add('disabled');
      element('.control.lettura').onclick = void(0);
    }
  }
}



function openBook(e) {
  element('#btnLib').onclick = undefined;
  let target = e.path[1];
  if (!target.getAttribute('isbn'))
    target = e.path[0];
  if (!target.getAttribute('isbn'))
    return

  let code = target.getAttribute('isbn');
  let list = target.getAttribute('list');
  let book = DB[list][code];

  console.log(amIReading(book.isbn));
  
  if (amIReading(book.isbn)) {
    loadMyBook(book.isbn);
    return;
  }

  if (!!code && !!list) {
    element('#titLib').innerText = book.title;
    element('#stLib').innerText = book.subtitle;
    element('#autLib').innerText = book.author;
    element('#pagLib').innerText = book.pages;
    element('#dsLib').innerText = book.desc;
    element('#imgLib').src = book.img

    if (list == 'all') {
      let actions = element('.alib');
      let button = element('#btnLib');

      if (isFree(book.isbn)) {

          selected = book.isbn;
          actions.style.opacity = '1';
          actions.style.visibility = 'visible';
          button.innerText = "Leggi questo";
          button.onclick = prenota;


        element('#clLib').innerText = 'Libero';
      } else {
        actions.style.opacity = '0';
        actions.style.visibility = 'hidden';

        let reference = DB.taken[book.isbn];
        element('#clLib').innerText = `0 copie rimaste libere`;
      }
    } else {
      let actions = element('.alib');
      element('#clLib').innerText = "Nei desideri";
      actions.style.opacity = '0';
      actions.style.visibility = 'hidden';
    }

    openInterface(2);
  }
}


function reload() {
  setTimeout(_ => {
    ipcRenderer.send("getData");
    clearDisplay();
    if (element('.active'))
      element('.active').classList.remove('active');
  }, 50);
}


function displayBooks(li) {
  let lists = Object.keys(DB);
  let tab = li;
  let free = li == "free";
  if (free) li = 'all';

  if (!!DB[li]) {
    if (!!Object.keys(DB[li]).length) {
      // Attiva uno dei tab colorandolo di ciano
      if (element('.active')) {
        // Controllo di non aver premuto un tab gia` attivo
        if (element('.active').classList.contains(tab))
          return;
        element('.active').classList.remove('active');
      }
      element('.' + tab).classList.add('active');

      let container = element('.book-container');
      let list = DB[li];

      clearDisplay();

      for (let k in list) {
        let book = list[k];
        let taken = li == "all" ? !isFree(k) : false;
        if (!free || !taken) {
          let bk = document.createElement('DIV');
          bk.classList.add('book');
          bk.addEventListener('click', openBook);
          bk.setAttribute('list', li);
          bk.setAttribute('isbn', book.isbn);
          bk.setAttribute('draggable', false);
          if (li == "all") bk.setAttribute('title',`${book.title}\nrimanenti: ${freeCopiesCount(book.isbn)}`);
          else bk.setAttribute('title', book.title);
          bk.innerHTML = `<img src="${book.img}" />`;
          if (taken) bk.setAttribute('taken', true);
          container.appendChild(bk);
        }
      }
      let separator = document.createElement('DIV');
      separator.classList.add('separator');
      container.appendChild(separator);

    }
  }
}


function clearDisplay() {
  var e = element(".book-container");
  var first = e.firstElementChild;
  while (first) {
    first.removeEventListener('click', openBook);
    first.remove();
    first = e.firstElementChild;
  }

  closeInterfaces();
}
