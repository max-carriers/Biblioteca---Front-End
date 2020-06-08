let log = require("./script/private/token/login.json");

document.addEventListener("logged", (e) => {
  log = JSON.parse(require("fs").readFileSync("./script/private/token/login.json"));
  console.log(log);
  
  if (!!log.token) {
    let form = element('#login');
    let blur = element('#log-blur');

    form.style.visibility = "hidden";
    form.style.opacity = "0";
    form.style.transform = "scale(1.1)";
    blur.style.visibility = "hidden";
    blur.style.opacity = "0";

    if (status["op-permission"] > 1) {
      element(".admin").style.opacity = "1";
      element(".admin").style.visibility = "visible";
    }
    loadMyBooks();
    removeLogError();
    if (log.op_level >= 2) {
      element(".admin").style.opacity = '1';
      element(".admin").style.visibility = "visible";
    }
  }
});


function removeLogError() {
  element('.uh1').style.color = "black";
  element('.uh2').style.color = "black";
  element('#user-name').classList.remove('red');
  element('#user-pass').classList.remove('red');
}

function setLogError(u, p) {
  let uh1 = element('.uh1');
  let uh2 = element('.uh2');
  let usn = element('#user-name');
  let usp = element('#user-pass');

  if (u) {
    uh1.style.color = "red";
    usn.classList.add('red');
  }

  if (p) {
    uh2.style.color = "red";
    usp.classList.add('red');
  }
}