var API_URL="https://script.google.com/macros/s/AKfycbyd289tlV4F6qRa0BcvF0tvfadDzIKkytmsp2kyL-XptG00-9XMyX_hTpYY86KdQn3Avg/exec";
function apiGet(action,cb){fetch(API_URL+"?action="+action).then(r=>r.text()).then(t=>cb(null,JSON.parse(t).data||[])).catch(e=>cb(e.toString(),[]));}
function apiPost(body,cb){fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(body)}).then(r=>r.text()).then(t=>cb(null,JSON.parse(t))).catch(e=>cb(e.toString(),{}));}
function badge(s){return "<span class='badge' style='background:"+({"Pending":"#da7101","Assigned":"#006494","In Progress":"#a12c7b","Completed":"#437a22","Open":"#a12c7b","Resolved":"#437a22","Active":"#437a22","Pending":"#da7101"}[s]||"#888")+"'>"+s+"</span>";}
function showMsg(id,text,err){var el=document.getElementById(id); if(el) el.innerHTML="<div class='"+(err?"err":"msg")+"'>"+text+"</div>";}
function loading(id,text){var el=document.getElementById(id); if(el) el.innerHTML="<div style='color:#999;padding:14px'><span class='spinner'></span> "+(text||"Loading...")+"</div>";}
function token(){return localStorage.getItem('homeserve_token')||'';}
function setToken(t){localStorage.setItem('homeserve_token',t);}
