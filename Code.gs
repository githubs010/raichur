// HomeServe Apps Script — FULLY FIXED v4
// Sheet ID and Web App URL are hardcoded
var SS_ID = "1BgvBDhBfKxBjnum55aY6I5KyK7ioizUYxRpkXXf4XPw";

// ── AUTO-CREATE sheet if missing (fixes appendRow null error) ────────────────
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SS_ID);
  var ws = ss.getSheetByName(name);
  if (!ws) {
    ws = ss.insertSheet(name);
    // Title row
    ws.getRange(1,1,1,headers.length).merge()
      .setValue("HomeServe — " + name)
      .setBackground("#01696F").setFontColor("#FFFFFF")
      .setFontWeight("bold").setHorizontalAlignment("center");
    // Header row
    ws.getRange(2,1,1,headers.length)
      .setValues([headers])
      .setBackground("#01696F").setFontColor("#FFFFFF").setFontWeight("bold");
    ws.setFrozenRows(2);
    ws.setColumnWidths(1, headers.length, 155);
    Logger.log("Created sheet: " + name);
  }
  return ws;
}

var BOOKING_HEADERS  = ["Booking ID","Customer Name","Phone","Service","Date","Time Slot","Address","Provider","Status","Payment","Amount","Commission","Notes","Created"];
var PROVIDER_HEADERS = ["Provider ID","Name","Phone","Skill","City","KYC","Status","Rating","Jobs Done","Registered"];
var ISSUE_HEADERS    = ["Issue ID","Booking ID","Customer","Description","Raised On","Assigned To","Priority","Status","Resolution","Resolved On"];
var SERVICE_HEADERS  = ["Service ID","Category","Description","Base Price","Duration","Status"];

// ── CORS-safe output ─────────────────────────────────────────────────────────
function corsOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET handler ──────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action = e.parameter.action;
    if      (action === "getBookings")  return corsOutput(readSheet("Bookings",  BOOKING_HEADERS));
    else if (action === "getProviders") return corsOutput(readSheet("Providers", PROVIDER_HEADERS));
    else if (action === "getIssues")    return corsOutput(readSheet("Issues",    ISSUE_HEADERS));
    else if (action === "getServices")  return corsOutput(readSheet("Services",  SERVICE_HEADERS));
    else if (action === "ping")         return corsOutput({status:"ok",message:"HomeServe API is live!"});
    else return corsOutput({status:"error",message:"Unknown action: "+action});
  } catch(err) {
    return corsOutput({status:"error",message:err.toString()});
  }
}

// ── POST handler ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    if      (action === "addBooking")          return corsOutput(addBooking(data));
    else if (action === "addIssue")            return corsOutput(addIssue(data));
    else if (action === "updateBookingStatus") return corsOutput(updateField("Bookings","Booking ID",BOOKING_HEADERS,data.bookingId,"Status",data.status));
    else if (action === "assignProvider")      return corsOutput(assignProvider(data));
    else if (action === "resolveIssue")        return corsOutput(resolveIssue(data));
    else return corsOutput({status:"error",message:"Unknown action: "+action});
  } catch(err) {
    return corsOutput({status:"error",message:err.toString()});
  }
}

// ── READ SHEET ────────────────────────────────────────────────────────────────
function readSheet(name, headers) {
  var ws = getOrCreateSheet(name, headers);
  var rows = ws.getDataRange().getValues();
  if (rows.length < 3) return {status:"ok", data:[]};
  var hdrs = rows[1];
  var data = [];
  for (var i = 2; i < rows.length; i++) {
    if (rows[i].some(function(v){ return v !== ""; })) {
      var obj = {};
      hdrs.forEach(function(h,j){ obj[h] = rows[i][j]; });
      data.push(obj);
    }
  }
  return {status:"ok", data:data};
}

// ── ADD BOOKING ───────────────────────────────────────────────────────────────
function addBooking(d) {
  var ws = getOrCreateSheet("Bookings", BOOKING_HEADERS);
  var id = "BK-" + new Date().getTime();
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy");
  ws.appendRow([id, d.name||"", d.phone||"", d.service||"", d.date||"", d.slot||"",
    d.address||"", "Not Assigned", "Pending", d.payment||"", parseFloat(d.amount)||0,
    0, d.notes||"", now]);
  return {status:"ok", bookingId:id, message:"Booking created! ID: "+id};
}

// ── ADD ISSUE ─────────────────────────────────────────────────────────────────
function addIssue(d) {
  var ws = getOrCreateSheet("Issues", ISSUE_HEADERS);
  var id = "ISS-" + new Date().getTime();
  var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy");
  ws.appendRow([id, d.bookingId||"", d.customer||"", d.description||"",
    now, "Admin", d.priority||"Medium", "Open", "Pending review", ""]);
  return {status:"ok", issueId:id, message:"Issue raised! ID: "+id};
}

// ── ASSIGN PROVIDER ───────────────────────────────────────────────────────────
function assignProvider(d) {
  var ws = getOrCreateSheet("Bookings", BOOKING_HEADERS);
  var rows = ws.getDataRange().getValues();
  for (var i = 2; i < rows.length; i++) {
    if (String(rows[i][0]) === String(d.bookingId)) {
      ws.getRange(i+1, 8).setValue(d.provider);
      ws.getRange(i+1, 9).setValue("Assigned");
      return {status:"ok", message:"Provider "+d.provider+" assigned to "+d.bookingId};
    }
  }
  return {status:"error", message:"Booking not found: "+d.bookingId};
}

// ── RESOLVE ISSUE ─────────────────────────────────────────────────────────────
function resolveIssue(d) {
  var ws = getOrCreateSheet("Issues", ISSUE_HEADERS);
  var rows = ws.getDataRange().getValues();
  for (var i = 2; i < rows.length; i++) {
    if (String(rows[i][0]) === String(d.issueId)) {
      ws.getRange(i+1, 8).setValue("Resolved");
      ws.getRange(i+1, 9).setValue(d.resolution || "Resolved by admin");
      ws.getRange(i+1, 10).setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MMM-yyyy"));
      return {status:"ok", message:"Issue "+d.issueId+" resolved."};
    }
  }
  return {status:"error", message:"Issue not found: "+d.issueId};
}

// ── UPDATE FIELD ──────────────────────────────────────────────────────────────
function updateField(sheetName, idCol, headers, id, col, val) {
  var ws = getOrCreateSheet(sheetName, headers);
  var rows = ws.getDataRange().getValues();
  var hdrs = rows[1];
  var colIdx = hdrs.indexOf(col) + 1;
  if (colIdx === 0) return {status:"error", message:"Column not found: "+col};
  for (var i = 2; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      ws.getRange(i+1, colIdx).setValue(val);
      return {status:"ok", message:"Updated "+id+" → "+val};
    }
  }
  return {status:"error", message:"Row not found: "+id};
}

// ── SETUP SHEETS ─────────────────────────────────────────────────────────────
// Run this once manually from Apps Script editor
function setupSheets() {
  // Force create all sheets
  getOrCreateSheet("Bookings",  BOOKING_HEADERS);
  getOrCreateSheet("Issues",    ISSUE_HEADERS);
  getOrCreateSheet("Services",  SERVICE_HEADERS);

  // Providers with seed data
  var pw = getOrCreateSheet("Providers", PROVIDER_HEADERS);
  if (pw.getLastRow() < 3) {
    [["PR-001","Naresh Chandra","9111122223","Plumbing","Vijayawada","Verified","Active",4.8,85,"01-Jan-2026"],
     ["PR-002","Priya Lakshmi","9222233334","Home Cleaning","Vijayawada","Verified","Active",4.9,120,"01-Jan-2026"],
     ["PR-003","Mahesh Kumar","9333344445","Electrical","Vijayawada","Verified","Active",4.7,64,"01-Feb-2026"],
     ["PR-004","Raju Babu","9444455556","Pest Control","Vijayawada","Pending","Under Review",0,0,"11-May-2026"],
     ["PR-005","Arjun Reddy","9555566667","AC Service","Vijayawada","Verified","Active",4.6,42,"01-Mar-2026"]
    ].forEach(function(r){ pw.appendRow(r); });
  }

  // Services seed data
  var sw = getOrCreateSheet("Services", SERVICE_HEADERS);
  if (sw.getLastRow() < 3) {
    [["SVC-01","Home Cleaning","Full deep clean","1200","2-3 hrs","Active"],
     ["SVC-02","Plumbing","Tap leaks pipe repair","400","1 hr","Active"],
     ["SVC-03","Electrical","Switches fans wiring","350","1 hr","Active"],
     ["SVC-04","Carpentry","Furniture assembly","500","1-2 hrs","Active"],
     ["SVC-05","AC Service","AC and appliance repair","700","1-2 hrs","Active"],
     ["SVC-06","Pest Control","Cockroach mosquito termite","900","2 hrs","Active"],
     ["SVC-07","Painting","Wall painting repaint","2500","4-8 hrs","Active"],
     ["SVC-08","Water Tank","Tank cleaning disinfection","800","2 hrs","Active"]
    ].forEach(function(r){ sw.appendRow(r); });
  }

  Logger.log("All sheets ready!");
  SpreadsheetApp.getUi().alert("✅ Setup complete! All 4 sheets are ready.");
}
