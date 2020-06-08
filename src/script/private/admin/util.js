function activateMod() {
   let modBtn = element("#mod");
   modBtn.classList.remove("disabled");

   modBtn.addEventListener("click", initUpdate);
}