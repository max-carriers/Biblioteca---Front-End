const gui = require('nw.gui');
const axios = require("axios");

let selected = {};
const element = (q) => document.querySelector(q);
const elements = (q) => document.querySelectorAll(q);

element("#user_display").addEventListener("keyup", (e) => {
   e.target.value = e.target.value.replace(/([^\w\d ])/gm, '');
   let chars = "";
   e.target.value.split(" ").map(word => {if (chars.length <= 3 && word !== "") {chars += word[0].toUpperCase();}});
   element("#chars").innerText = chars;
});

// imposta la dimensione fissa della finestra
let win = gui.Window.get();
win.setMaximumSize(1280, 720);
win.setMinimumSize(1280, 720);

////////////////////////////////////////////////////////////////////////////////
function getNewID() {
   let ok = false;
   let uuid = "";

   while (!ok) {
      const exp = require('randexp');
      let randomCode = new exp("@([A-Za-z0-9_-]{9})");
      uuid = randomCode.gen();

      ok = true;
      for (let k in users) if (uuid === k) ok = false;
   }

   return uuid;
}
////////////////////////////////////////////////////////////////////////////////
function createAuth(user, pass) {
   const crypto = require('crypto');

   let hasher = crypto.createHash("sha256");
   hasher.update(user);
   let userH = hasher.digest('hex');
   hasher = crypto.createHash("sha256");
   hasher.update(pass);
   let passH = hasher.digest('hex');

   return {user: userH, pass: passH};
}
////////////////////////////////////////////////////////////////////////////////
function generateUser() {
   let display = element("#user_display").value;
   let user = element("#user_name").value;
   let pass = element("#user_pass").value;

   if (!display || !user || !pass) {
      alert("Alcuni campi sono rimasti vuoti...");
      return;
   }

   let uuid = getNewID();
   let final = {uuid: uuid, display: display, ...createAuth(user, pass)};
   cloudCreateUser(final);

}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function openSideMenu(id) {
   let all = ["utente", "libro", "prenotazioni"];
   if (all.indexOf(id) == -1) return;
   // closeAllMenus();
   element("#"+id).style.transform = "translateX(0vw)";
   let blur = element("#bg");
   blur.style.visibility = "visible";
   blur.style.opacity = "1";
   element("#chars").innerText = "#";
}
////////////////////////////////////////////////////////////////////////////////
function closeAllMenus() {
   let all = ["utente", "libro", "prenotazioni"];
   for (let m in all) element("#"+all[m]).style.transform = "translateX(-30vw)";
   let blur = element("#bg");
   blur.style.visibility = "hidden";
   blur.style.opacity = "0";
   selected = {};

   element('#bTitle').disabled = true;
   element('#bSub').disabled = true;
   element('#bAuth').disabled = true;
   element('#bPages').disabled = true;
   element('#bDesc').disabled = true;
   let modBtn = element("#mod");
   modBtn.classList.add("disabled");
   modBtn.removeEventListener("click", initUpdate);
}
////////////////////////////////////////////////////////////////////////////////
function hideAll() {
   element(".reservations").classList.add("hidden");
   // element(".reservations").innerHTML = "";
   element(".container").classList.add("hidden");
   // element(".container").innerHTML = "";
   element(".book-container").classList.add("hidden");
   // element(".book-container").innerHTML = "";
   element(".users").classList.remove("active");
   element(".all").classList.remove("active");
   element(".wish").classList.remove("active");
   element(".books").classList.remove("active");

   let e = element(".book-container");
   let first = e.firstElementChild;
   while (first) {
      first.removeEventListener('click', openBook);
      first.remove();
      first = e.firstElementChild;
   }

   e = element(".container");
   first = e.firstElementChild;
   while (first) {
      first.removeEventListener('click', openUser);
      first.remove();
      first = e.firstElementChild;
   }

   e = element(".reservations");
   first = e.firstElementChild;
   while (first) {
      first.removeEventListener('click', openReservation);
      first.remove();
      first = e.firstElementChild;
   }
}
////////////////////////////////////////////////////////////////////////////////
function showUsers() {
   if (element(".users").classList.contains("active")) return;
   hideAll();
   element(".users").classList.add("active");
   let userslist = element(".container");
   userslist.classList.remove("hidden");
   for (let u in users) {
      let user = document.createElement('div');
      user.classList.add("user");
      user.addEventListener("click", openUser);
      user.setAttribute("uuid", u);
      user.innerHTML += `<span><div class="uuid">${u}</div><div class="display">${users[u].display}</div></span>`;
      userslist.appendChild(user)
   }
   let s = document.createElement('div');
   s.classList.add("separator");
   userslist.appendChild(s);
}
////////////////////////////////////////////////////////////////////////////////
function showReservations() {
   if (element(".books").classList.contains("active")) return;
   hideAll();
   element(".books").classList.add("active");
   let res = element(".reservations");
   res.classList.remove("hidden");
   for (let r in DB.taken) {
      let rr = document.createElement("div");
      rr.classList.add("user");
      rr.setAttribute("uuid", r);

      rr.addEventListener('click', openReservation);
      rr.innerHTML += `<span><div class="uuid">${r}</div><div class="display">${users[r].display}</div><div class="books">${Object.keys(DB.taken[r].list).length} libri</div></span>`;
      res.appendChild(rr);
   }
   let s = document.createElement('div');
   s.classList.add("separator");
   res.appendChild(s);
}
////////////////////////////////////////////////////////////////////////////////
function showBooks(li) {
   let tab = li;

   if (!!DB[li]) {
      if (!!Object.keys(DB[li]).length) {
         if (li == 'all') {if (element('.all.tab').classList.contains("active")) return;}
         else {if (element('.wish.tab').classList.contains("active")) return;}
         hideAll();
         if (li == 'all') {
            element('.all.tab').classList.add("active");
            element('.wish.tab').classList.remove("active");
         } else {
            element('.wish.tab').classList.add("active");
            element('.all.tab').classList.remove("active");
         }

         let container = element('.book-container');
         let list = DB[li];         
         let books = element(".book-container");
         books.classList.remove("hidden");

         for (let k in list) {
            let book = list[k];
            let bk = document.createElement('DIV');
            bk.classList.add('book');
            bk.addEventListener('click', openBook);
            bk.setAttribute('list', li);
            bk.setAttribute('isbn', book.isbn);
            bk.setAttribute('draggable', false);
            if (li == "all") bk.setAttribute('title', `${book.title}`);
            else bk.setAttribute('title', book.title);
            bk.innerHTML = `<img draggable="false" src="${book.img}" />`;
            container.appendChild(bk);
         }
         let separator = document.createElement('DIV');
         separator.classList.add('separator');
         container.appendChild(separator);
      }
   }
}
////////////////////////////////////////////////////////////////////////////////
function initTransfer() {
   if (!selected.isbn) return;
   if (!DB.wish[selected.isbn]) return;

   let copies = prompt("Quante COPIE FISICHE saranno aggiunte alla biblioteca?");
   if (isNaN(copies)) {alert('"'+copies+'" non e` un numero!'); return;}
   if (copies == null) {return;}
   console.log(copies);
   
   cloudPerformTransfer(selected.isbn, copies);
}
////////////////////////////////////////////////////////////////////////////////
function initDrop() {
   if (!selected.isbn) return;
   if (!DB.wish[selected.isbn] && !DB.all[selected.isbn]) return;
   let ok = confirm("Sei sicuro di voler CANCELLARE questo libro?\nL'operazione e` irreversibile!");
   if (!ok) return;

   let from = !!DB.wish[selected.isbn] ? "desideri":"libri";
   let isbn = selected.isbn;
   cloudPerformDrop(isbn, from);
}
////////////////////////////////////////////////////////////////////////////////
function initUpdate() {
   if (!selected.isbn) return;
   if (!DB.wish[selected.isbn] && !DB.all[selected.isbn]) return;
   if (!!element('#mod').disabled) return;

   let book = {
      title: element('#bTitle').value,
      subtitle: element('#bSub').value,
      author: element('#bAuth').value,
      pages: Number.parseInt(element('#bPages').value),
      desc: element('#bDesc').value,
   }

   let from = "";
   if (!!DB.all[selected.isbn]) {
      book.copies = Number.parseInt(element("#bVolumes").value);
      from = "libri";
   } else {
      from = "desideri";
   }

   for (let k in book)
      if (book[k] === selected[k]) delete book[k];
   if (Object.keys(book).length == 0) return;

   book.isbn = selected.isbn;   
   cloudPerformUpdate(book, from);
}
////////////////////////////////////////////////////////////////////////////////
function openBook(e) {
   let target = null;
   for (let elm in e.path) {
      if (!!e.path[elm].classList)
      if (e.path[elm].classList.contains("book")) target = e.path[elm];
   }
   if (target == null) return;
   let code = target.getAttribute('isbn');
   element('#vCount').classList.add("hidden");
   element('#transfer').classList.add("hidden");
   if (!!DB.all[code]) {
      selected = DB.all[code];
      selected.from = "libri";
      element('#bTitle').value = selected.title;
      element('#bSub').value = selected.subtitle;
      element('#bAuth').value = selected.author;
      element('#bPages').value = selected.pages;
      element('#bVolumes').value = selected.copies;
      element('#bDesc').value = selected.desc;
      element('#imgLib').src = selected.img;

      element('#vCount').classList.remove("hidden");
      openSideMenu("libro");
   } else if (!!DB.wish[code]) {
      selected = DB.wish[code];
      selected.from = "desideri";
      element('#bTitle').value = selected.title;
      element('#bSub').value = selected.subtitle;
      element('#bAuth').value = selected.author;
      element('#bPages').value = selected.pages;
      element('#bDesc').value = selected.desc;
      element('#imgLib').src = selected.img;

      element('#transfer').classList.remove("hidden");
      openSideMenu("libro");
   }
   
}
////////////////////////////////////////////////////////////////////////////////
function openReservation(e) {
   let target = null;
   for (let elm in e.path) {
      if (!!e.path[elm].classList)
      if (e.path[elm].classList.contains("user")) target = e.path[elm];
   }
   if (target == null) return;
   let code = target.getAttribute("uuid");
   if (!DB.taken[code]) return;
   let side = element("#prenotazioni ul");
   side.innerHTML = "";
   for (let isbn in DB.taken[code].list) {
      let book = DB.all[isbn];
      side.innerHTML += `<li><img draggable="false" src="${book.img}" alt="" /><div><strong>Codice ISBN:</strong><br><span>${isbn}</span></div><div><strong>Titolo:</strong><br>${book.title}</div><div><strong>Data di prenotazione:</strong><br>${DB.taken[code].list[isbn]}</div></li>`;
   }
   openSideMenu("prenotazioni");
}
////////////////////////////////////////////////////////////////////////////////
function openUser(e) {
   let target = null;
   for (let elm in e.path) {
      if (!!e.path[elm].classList)
         if (e.path[elm].classList.contains("user")) target = e.path[elm];
   }
   if (target == null) return;
   console.log(target.getAttribute('uuid'));
};






