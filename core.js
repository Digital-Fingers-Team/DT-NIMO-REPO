(function(){
  var css = 
    ".toast-container{position:fixed;top:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:10px}"+
    "body.rtl .toast-container{left:20px;right:auto}"+
    ".toast{padding:12px 16px;border-radius:8px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.1);animation:fadeIn .3s ease-out;font-weight:600}"+
    ".toast-success{background:#00b894}"+
    ".toast-error{background:#e74c3c}"+
    ".toast-info{background:#6c5ce7}"+
    "@keyframes fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}" +
    /* Sidebar Toggle Styles */
    ".sidebar-toggle{display:none;background:var(--primary);color:white;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;font-size:20px;z-index:1001;margin-left:15px;margin-right:15px;transition:var(--transition);box-shadow: 0 2px 5px rgba(0,0,0,0.1);}"+
    ".sidebar-toggle:hover{background:var(--primary-dark);transform: scale(1.05);}"+
    "@media (max-width: 992px) {"+
    "  .sidebar-toggle{display:block;}"+
    "  .sidebar{transform:translateX(100%)!important;width:280px!important;max-width:85vw!important;position:fixed!important;top:0;bottom:0;z-index:2000!important;transition:transform 0.3s ease-in-out!important;display:flex!important;right:0!important;left:auto!important;box-shadow: -5px 0 15px rgba(0,0,0,0.1)!important;}"+
    "  body.ltr .sidebar{transform:translateX(-100%)!important;left:0!important;right:auto!important;box-shadow: 5px 0 15px rgba(0,0,0,0.1)!important;}"+
    "  .sidebar.open{transform:translateX(0)!important;}"+
    "  .main-content{margin-right:0!important;margin-left:0!important;width:100%!important;padding:15px!important;}"+
    "  .sidebar-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:1999;backdrop-filter: blur(2px);}"+
    "  .sidebar-overlay.active{display:block;}"+
    "  .sidebar-header .logo-text, .user-info, .menu-item span{display:block!important;}"+
    "  .menu-item a{justify-content:flex-start!important;}"+
    "  .header{padding:12px 15px!important;gap:10px!important;flex-direction: row!important;justify-content: space-between!important;align-items: center!important;}"+
    "  .header h1{font-size:18px!important;margin: 0!important;text-align: right!important;flex: 1!important;}"+
    "  body.ltr .header h1{text-align: left!important;}"+
    "  .header-actions{gap: 8px!important;}"+
    "  .dark-mode-toggle span, .logout-btn span{display: none!important;}"+
    "  .dark-mode-toggle, .logout-btn{padding: 8px!important;}"+
    "}";

  var styleId = "dtedu-core-style";
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

  // Sidebar Toggle Logic
  function initSidebarToggle() {
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');
    
    if (!header || !sidebar || document.getElementById('sidebar-toggle-btn')) return;

    // Create Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'sidebar-toggle-btn';
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Insert toggle button before header title
    header.insertBefore(toggleBtn, header.firstChild);

    // Toggle events
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });

    // Close sidebar on menu item click (optional but good for mobile)
    const menuItems = sidebar.querySelectorAll('.menu-item a');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        }
      });
    });
  }

  // Sidebar User Info (name + role) from the logged-in user
  var SUBJECT_NAMES = {
    math: { ar: "الرياضيات", en: "Mathematics" },
    arabic: { ar: "اللغة العربية", en: "Arabic" },
    science: { ar: "العلوم", en: "Science" },
    english: { ar: "الإنجليزية", en: "English" },
    history: { ar: "التاريخ", en: "History" }
  };

  function getRoleLabel(user, isRTL) {
    var type = (user && user.type) || "";
    if (type === "teacher") {
      var subj = user.subject && SUBJECT_NAMES[user.subject];
      if (subj) return isRTL ? "معلم " + subj.ar : "Teacher " + subj.en;
      return isRTL ? "معلم" : "Teacher";
    }
    if (type === "admin") return isRTL ? "مدير المدرسة" : "School Director";
    if (type === "student") return isRTL ? "طالب" : "Student";
    if (type === "parent") return isRTL ? "ولي أمر" : "Parent";
    return "";
  }

  function updateSidebarUser() {
    var raw = localStorage.getItem("currentUser");
    if (!raw) return;
    var user;
    try { user = JSON.parse(raw); } catch (e) { return; }
    if (!user || !user.type) return;

    var isRTL = document.body.classList.contains("rtl") ||
      (!document.body.classList.contains("ltr") &&
        (localStorage.getItem("currentLanguage") || "ar") === "ar");

    var nameAr = user.name || "";
    var nameEn = user.nameEn || nameAr;
    var displayName = isRTL ? nameAr : nameEn;
    if (displayName) {
      document.querySelectorAll(".user-name").forEach(function (el) {
        el.textContent = displayName;
      });
    }

    var role = getRoleLabel(user, isRTL);
    if (role) {
      document.querySelectorAll(".user-type").forEach(function (el) {
        el.textContent = role;
      });
    }
  }

  function initCore() {
    initSidebarToggle();
    updateSidebarUser();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCore);
  } else {
    initCore();
  }
})();


