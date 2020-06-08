
// 4 interfacce
//   - input per ISBN
//   - visualizzazione post input ISBN
//   - visualizzazione libro nella lista
//   - visualizzazione lettura in corso

// importo la libreria principale di jQuery
const $ = require("jquery");
const gui = require('nw.gui');

// imposta la dimensione fissa della finestra
let win = gui.Window.get();
win.setMaximumSize(1280, 720);
win.setMinimumSize(1280, 720);


// element serve per scrivere meno codice poi (chiama querySelector)

const element = (q) => document.querySelector(q);
const elements = (q) => document.querySelectorAll(q);

// Il libro che viene trovato tramite la funzione fetchBook()
let fetchedBook = {}

// apro una delle interfacce a scelta facendo apparire #bg
function openInterface(type) {
  let interfaces = ['#input', '#lettura', '#libro', '#letture'];
  let interface = element(interfaces[type]);
  let bg = element('#bg');
    
  bg.style.opacity = '1';
  bg.style.visibility = 'visible';
  console.log(interface);
  interface.style.transform = 'translateX(0vw)';
}

// chiudo ogni interfaccia e faccio sparire il #bg
function closeInterfaces() {
  let bg = element('#bg');
  let isbn = element('#input');   // 1
  let lett = element('#lettura'); // 2
  let lib = element('#libro');    // 3
  let lettt = element('#letture'); // 4
  let inputs = elements('input');

  bg.style.opacity = '0';
  bg.style.visibility = 'hidden';
  isbn.style.transform = 'translateX(-30vw)';
  lett.style.transform = 'translateX(-30vw)';
  lettt.style.transform = 'translateX(-30vw)';
  lib.style.transform = 'translateX(-30vw)';

  for (let i of inputs) i.value = "";
}

// faccio apparire una scritta di errore appena sotto l'input dell'ISBN
function setError(string) {
  element("#input").classList.add("error");
  element(".hint").innerText = string;
}

// faccio scomparire la scritta di errore
function removeError() {
  element("#input").classList.remove("error");
  element(".hint").innerText = "Inserisci il codice ISBN del libro";
}

// funzione principale per la ricerca dei libri
function fetchBook() {
  let raw = element("#ISBN").value.toString();
  let converted = raw.replace(/-/g, '').replace(/ /g, '');

  if (raw === '') {
    setError("400: Non hai inserito nulla");
    return;
  }

  if (converted.length !== 10 && converted.length !== 13) {
    setError("401: Lunghezza codice non valida");
    return;
  }

  $.ajax({
    url: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + converted,
    dataType: "json",
    success: (list) => {
      if (list.totalItems == 0) {
        setError("404: Codice non trovato");
        return;
      }
      console.log(list.items[0].volumeInfo);
      
      let { title, subtitle, authors, pageCount, description, categories, industryIdentifiers, imageLinks } = list.items[0].volumeInfo;
      fetchedBook = {
        title: title,
        subtitle: !!subtitle ? subtitle : "...",
        author: !!authors ? authors[0] : '...',
        pages: !!pageCount ? pageCount : "?",
        desc: !!description ? description : "assente",
        cat: !!categories ? categories[0] : "...",
        isbn: industryIdentifiers[0].identifier,
        img: !!imageLinks ? imageLinks.thumbnail : ""
      }
      displayFetchedBook();
    },
    error: (e) => { setError("404: Libro non trovato") }
  });
}

function displayFetchedBook() {
  let book = fetchedBook;
  element('#titLib').innerText = book.title;
  element('#stLib').innerText = book.subtitle;
  element('#autLib').innerText = book.author;
  element('#pagLib').innerText = book.pages;
  element('#dsLib').innerText = book.desc;
  element('#imgLib').src = book.img;
  element('#clLib').innerText = "Da aggiungere ai desideri?";

  let actions = element('.alib');
  let button = element('#btnLib');

  actions.style.opacity = '1';
  actions.style.visibility = 'visible';
  button.innerText = "Aggiungi";
  button.onclick = () => {aggiungiLibroCloud(book);};
  openInterface(2)
}


// funzione per eseguilre l'accesso alla piattaforma
function tryLogin() {
  let user = element('#user-name').value;
  let pass = element('#user-pass').value;
  if (!user || !pass) {
    removeLogError();
    setLogError(!user, !pass);
  } else {
    let crypto = require('crypto');
    let hUser = crypto.createHash('sha256').update(user);
    let hPass = crypto.createHash('sha256').update(pass);
    login(hUser.digest('hex'), hPass.digest('hex'));
  }

}