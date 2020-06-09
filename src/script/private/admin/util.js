let modifiedUser = {};

function activateMod() {
   let modBtn = element("#mod");
   modBtn.classList.remove("disabled");
   modBtn.addEventListener("click", initUpdate);
}

// Non completamente implementata
// Il funzionamento e` stato bloccato
function activateUserMod() {
   return;
   let modBtn = element("#userMod");
   modBtn.classList.remove("disabled");
   modBtn.addEventListener("click", initUserUpdate);
}

// Non completamente implementata
// Il funzionamento e` stato bloccato
function modifyUser(param) {
   return;
   let params = {display: "NOME", user: "USERNAME", pass: "PASSWORD"};
   if (!(param in params)) return;
   let input = prompt("Inserisci il nuovo valore per il campo '"+params[param]+"'");
   let second = prompt("Inserisci ancora il campo '" + params[param] + "' per conferma");

   if (input !== second) {alert("ERRORE - I valori inseriti non sono uguali"); return}
   if (param.match(/^(user|pass){1}$/m)) {
      let cr = require("crypto");
      let h = cr.createHash("sha256");
      h.update(input);
      let crypted = h.digest("hex");
      modifiedUser[param] = crypted;
   } else {
      modifiedUser.display = input;
   }

   activateUserMod();
}
