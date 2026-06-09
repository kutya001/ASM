const GAS_URL = "https://script.google.com/macros/s/AKfycbwohflNTW3z1cknnf80XAEhmavcITwdt9PYSUEq6EJP-2EmsxHiRBNvcUSGJ_i-cu-4/exec";

fetch(GAS_URL, {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: JSON.stringify({ action: "getUsernames" })
})
.then(r => r.text())
.then(t => {
  console.log("Body:", t.substring(0, 500));
})
.catch(e => console.error(e));
