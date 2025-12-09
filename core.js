(function(){
  var css = 
    ".toast-container{position:fixed;top:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:10px}"+
    "body.rtl .toast-container{left:20px;right:auto}"+
    ".toast{padding:12px 16px;border-radius:8px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.1);animation:fadeIn .3s ease-out;font-weight:600}"+
    ".toast-success{background:#00b894}"+
    ".toast-error{background:#e74c3c}"+
    ".toast-info{background:#6c5ce7}"+
    "@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}";
  var styleId = "dtedu-toast-style";
  if (!document.getElementById(styleId)) {
    var s = document.createElement("style");
    s.id = styleId;
    s.textContent = css;
    document.head.appendChild(s);
  }
  function ensureContainer(){
    var c = document.getElementById("toast-container");
    if(!c){
      c = document.createElement("div");
      c.id = "toast-container";
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }
  window.showToast = function(type, message){
    var c = ensureContainer();
    var t = document.createElement("div");
    t.className = "toast toast-" + type;
    t.textContent = String(message);
    c.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4000);
  };
  var originalAlert = window.alert;
  window.alert = function(message){
    window.showToast("info", String(message));
  };
})();

