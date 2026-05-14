// HomeServe API — Fixed for CORS
var API_URL = "https://script.google.com/macros/s/AKfycbyQ8CFYtDYPv3oHRI9h-SpywDlzUkbcc7XuZNV7EySTUt6_16WCkL1KAbYbM80rIv8Dfg/exec";

function apiGet(action, cb) {
  fetch(API_URL + "?action=" + action, {
    method: "GET",
    redirect: "follow"
  })
  .then(function(r){ return r.text(); })
  .then(function(text){
    try {
      var d = JSON.parse(text);
      cb(null, d.data || []);
    } catch(e) {
      cb("Parse error: " + text.substring(0,100), []);
    }
  })
  .catch(function(e){ cb(e.toString(), []); });
}

function apiPost(body, cb) {
  fetch(API_URL, {
    method: "POST",
    redirect: "follow",
    headers: {"Content-Type": "text/plain"},
    body: JSON.stringify(body)
  })
  .then(function(r){ return r.text(); })
  .then(function(text){
    try {
      var d = JSON.parse(text);
      cb(null, d);
    } catch(e) {
      cb("Parse error: " + text.substring(0,100), {});
    }
  })
  .catch(function(e){ cb(e.toString(), {}); });
}

function badge(status) {
  var colors = {
    "Pending":"#da7101","Assigned":"#006494","In Progress":"#01696f",
    "Completed":"#437a22","Open":"#a12c7b","Resolved":"#437a22",
    "Under Review":"#da7101","Active":"#437a22","Settled":"#437a22",
    "High":"#c0392b","Medium":"#da7101","Low":"#6f6c65"
  };
  return "<span class='badge' style='background:"+(colors[status]||"#888")+"'>"+status+"</span>";
}

function showMsg(id, text, isErr) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = "<div class='"+(isErr?"err":"msg")+"'>"+text+"</div>";
}

function loading(id, text) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = "<div style='color:#999;padding:12px'><span class='spinner'></span>"+(text||"Loading from Google Sheets...")+"</div>";
}
