// Temporary verification harness: simulates a large assignment submission.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const LOG = path.join(ROOT, "_verify_log.txt");
const log = (m) => fs.appendFileSync(LOG, m + "\n");
fs.writeFileSync(LOG, "start\n");

const seed = `
<script>
try {
  localStorage.setItem('currentUser', JSON.stringify({id:'student1',name:'أحمد الطالب',type:'student',class:'10a',email:'student@dtedu.com'}));
  var aid = 111222333;
  localStorage.setItem('teacherAssignments', JSON.stringify([{id:aid,title:'واجب تجريبي',subject:'math',subjectName:'الرياضيات',className:'الصف العاشر - أ',class:'10a',teacherId:'teacher1',teacherName:'أ. محمد',dueDate:new Date(Date.now()+7*864e5).toISOString(),maxGrade:10,description:'desc'}]));
  window.__aid = aid;
} catch(e){}
</script>
`;

// Runs synchronously right before </body>, after the main app script is defined.
const test = `
<script>
(function(){
  var out = { phase: "sync" };
  try {
    var dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(4*1024*1024)], "واجب.pdf", {type:"application/pdf"}));
    document.getElementById('submit-file').files = dt.files;
    document.getElementById('submit-assignment').value = String(window.__aid);
    window.submitAssignment();
    var subs = JSON.parse(localStorage.getItem('studentSubmissions')||'[]');
    var last = subs[subs.length-1];
    out.count = subs.length;
    out.fileContentIsNull = last ? (last.fileContent === null) : null;
    out.fileName = last ? last.fileName : null;
    out.toast = (document.querySelector('#toast-container')||document.body).textContent.replace(/\\s+/g,' ').trim().slice(0,160);
  } catch(e) {
    out.error = e && e.message ? e.message : String(e);
  }
  var d = document.createElement('div');
  d.id = 'testreport';
  d.textContent = 'RESULT:' + JSON.stringify(out);
  document.body.appendChild(d);

  // Phase 2: confirm the blob actually landed in IndexedDB
  setTimeout(function(){
    try {
      if (!window.uploadsDB) { document.getElementById('testreport').textContent += ' INDEXEDDB_MISSING'; return; }
      window.uploadsDB.files.toArray().then(function(files){
        var match = files.filter(function(f){ return f.type === 'submission'; });
        var rec = match.length ? match[match.length-1] : null;
        document.getElementById('testreport').textContent +=
          ' ASYNC:' + JSON.stringify({ subs: match.length, refId: rec ? rec.refId : null, blobOk: !!(rec && rec.fileBlob && rec.fileBlob.size > 0) });
      }).catch(function(e){ document.getElementById('testreport').textContent += ' ASYNC_ERR:' + e; });
    } catch(e) {}
  }, 300);
})();
</script>
`;

let html = fs.readFileSync(path.join(ROOT, "student-dashboard.html"), "utf8");
html = html.replace("</head>", seed + "</head>");
html = html.replace("</body>", test + "</body>");
fs.writeFileSync(path.join(ROOT, "_verify_page.html"), html);

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/_verify_page.html";
  const fp = path.join(ROOT, p);
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end(""); return; }
  const ext = path.extname(fp);
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json" };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  res.end(fs.readFileSync(fp));
});

const PORT = 8095;
server.listen(PORT, () => {
  log("listening on " + PORT);
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  log("chromeExists=" + fs.existsSync(chrome));
  const profile = path.join(require("os").tmpdir(), "verify_profile_" + Date.now());
  const r = spawnSync(chrome, [
    "--headless=new", "--no-sandbox", "--disable-gpu",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--user-data-dir=" + profile,
    "--virtual-time-budget=8000",
    "--dump-dom",
    "http://127.0.0.1:" + PORT + "/_verify_page.html",
  ], { encoding: "utf8", timeout: 45000 });
  const dom = (r.stdout || "") + "";
  log("status=" + r.status + " stdoutLen=" + dom.length + " err=" + (r.error ? String(r.error) : "none"));
  fs.writeFileSync(path.join(ROOT, "_verify_dom.txt"), dom);
  const m = dom.match(/RESULT:(\{.*?\})(?: ASYNC:(\{.*?\}))?(?: ASYNC_ERR:([^<]*))?(?: INDEXEDDB_MISSING)?<\/div>/);
  let result = m ? (m[1] + (m[2] ? " | ASYNC:" + m[2] : (m[3] ? " | ASYNC_ERR:" + m[3] : ""))) : ("NO_REPORT len=" + dom.length);
  fs.writeFileSync(path.join(ROOT, "_verify_result.txt"), result);
  log("done result=" + result);
  server.close();
  process.exit(0);
});
