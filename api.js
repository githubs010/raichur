// Replace with YOUR deployed Apps Script Web App URL
var API_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

function apiGet(action, cb) {
  var url = API_URL + "?action=" + action;
  fetch(url)
    .then(r => r.json())
    .then(d => cb(null, d.data || []))
    .catch(e => cb(e, []));
}

function apiPost(body, cb) {
  fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(d => cb(null, d))
  .catch(e => cb(e, {}));
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
  if (el) { el.innerHTML = "<div class='"+(isErr?"err":"msg")+"'>"+text+"</div>"; }
}

function loading(id, text) {
  var el = document.getElementById(id);
  if (el) { el.innerHTML = "<div style='color:#999;padding:12px'><span class='spinner'></span>"+(text||"Loading...")+"</div>"; }
}
