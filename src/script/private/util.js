
const tabs = elements('.tab');
for (tab of tabs) {
   tab.addEventListener('click', (e) => {
      let target = e.target.getAttribute('opens');
      displayBooks(target);
   });
}

element('.button.annLett').onclick = rilascia;

// 
function openAdminSide() {
   if (require("./script/private/token/status.json")["op-permission"] < 2) {
      return;
   }

   let gui = require('nw.gui');
   let current = gui.Window.get();
   current.minimize();
   
   current.on('close', () => {
      process.exit();
   });

   let win = gui.Window.open('../admin.html', {}, (w) => {
      w.setMaximumSize(1280, 720);
      w.setMinimumSize(1280, 720);
      w.setPosition("center");
      w.show();
      w.restore();
      current.setProgressBar(99);

      w.on('closed', function () {
         w = null;         
         current.restore();
      });
   });
   
   // current.hide();
}
