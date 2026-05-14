
// ── HomeServe Google Apps Script Backend ──────────────────────────────────
// Deploy as Web App: Execute as Me, Anyone can access

var SS_ID = "YOUR_SPREADSHEET_ID"; // ← paste your Google Sheet ID here

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

function doGet(e) {
  var action = e.parameter.action;
  var result = {};

  if (action === "getBookings") {
    result = readSheet("Bookings");
  } else if (action === "getProviders") {
    result = readSheet("Providers");
  } else if (action === "getIssues") {
    result = readSheet("Issues");
  } else if (action === "getServices") {
    result = readSheet("Services");
  } else {
    result = { status: "error", message: "Unknown action" };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  var result = {};

  if (action === "addBooking") {
    result = addBooking(data);
  } else if (action === "addIssue") {
    result = addIssue(data);
  } else if (action === "updateBookingStatus") {
    result = updateStatus("Bookings", data.bookingId, "Status", data.status);
  } else if (action === "assignProvider") {
    result = assignProvider(data);
  } else if (action === "resolveIssue") {
    result = resolveIssue(data);
  } else if (action === "updateIssueStatus") {
    result = updateStatus("Issues", data.issueId, "Status", data.status, data.resolution);
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── READ SHEET ──────────────────────────────────────────────────────────────
function readSheet(name) {
  var ws = getSheet(name);
  if (!ws) return { status: "error", message: "Sheet not found: " + name };
  var rows = ws.getDataRange().getValues();
  if (rows.length < 2) return { status: "ok", data: [] };
  var headers = rows[1]; // row 2 = headers
  var data = [];
  for (var i = 2; i < rows.length; i++) {
    if (rows[i].some(function(v){ return v !== ""; })) {
      var obj = {};
      headers.forEach(function(h, j) { obj[h] = rows[i][j]; });
      data.push(obj);
    }
  }
  return { status: "ok", data: data };
}

// ── ADD BOOKING ─────────────────────────────────────────────────────────────
function addBooking(d) {
  var ws = getSheet("Bookings");
  var id = "BK-" + Date.now();
  var now = new Date().toLocaleDateString("en-IN");
  ws.appendRow([
    id, d.name, d.phone, d.service, d.date, d.slot,
    d.address, "Not Assigned", "Pending", d.payment,
    d.amount || 0, 0, d.notes, now
  ]);
  return { status: "ok", bookingId: id, message: "Booking created successfully!" };
}

// ── ADD ISSUE ───────────────────────────────────────────────────────────────
function addIssue(d) {
  var ws = getSheet("Issues");
  var id = "ISS-" + Date.now();
  var now = new Date().toLocaleDateString("en-IN");
  ws.appendRow([
    id, d.bookingId, d.customer, d.description,
    now, "Admin", d.priority, "Open", "Pending review", ""
  ]);
  return { status: "ok", issueId: id, message: "Issue raised successfully!" };
}

// ── ASSIGN PROVIDER ─────────────────────────────────────────────────────────
function assignProvider(d) {
  var ws = getSheet("Bookings");
  var rows = ws.getDataRange().getValues();
  for (var i = 2; i < rows.length; i++) {
    if (rows[i][0] === d.bookingId) {
      ws.getRange(i + 1, 9).setValue("Assigned");   // Status col
      ws.getRange(i + 1, 8).setValue(d.provider);   // Provider col
      return { status: "ok", message: "Provider " + d.provider + " assigned to " + d.bookingId };
    }
  }
  return { status: "error", message: "Booking not found: " + d.bookingId };
}

// ── RESOLVE ISSUE ────────────────────────────────────────────────────────────
function resolveIssue(d) {
  var ws = getSheet("Issues");
  var rows = ws.getDataRange().getValues();
  for (var i = 2; i < rows.length; i++) {
    if (rows[i][0] === d.issueId) {
      ws.getRange(i + 1, 8).setValue("Resolved");
      ws.getRange(i + 1, 9).setValue(d.resolution || "Resolved by admin");
      ws.getRange(i + 1, 10).setValue(new Date().toLocaleDateString("en-IN"));
      return { status: "ok", message: "Issue " + d.issueId + " resolved." };
    }
  }
  return { status: "error", message: "Issue not found." };
}

// ── UPDATE STATUS ────────────────────────────────────────────────────────────
function updateStatus(sheet, id, col, val, extra) {
  var ws = getSheet(sheet);
  var rows = ws.getDataRange().getValues();
  var headers = rows[1];
  var colIdx = headers.indexOf(col) + 1;
  for (var i = 2; i < rows.length; i++) {
    if (rows[i][0] === id) {
      ws.getRange(i + 1, colIdx).setValue(val);
      if (extra) ws.getRange(i + 1, headers.indexOf("Resolution") + 1).setValue(extra);
      return { status: "ok", message: "Updated." };
    }
  }
  return { status: "error", message: "Row not found." };
}

// ── SETUP SHEETS (Run once manually) ────────────────────────────────────────
function setupSheets() {
  var ss = SpreadsheetApp.openById(SS_ID);

  function makeSheet(name, title, headers) {
    var existing = ss.getSheetByName(name);
    if (existing) ss.deleteSheet(existing);
    var ws = ss.insertSheet(name);
    ws.getRange(1,1,1,headers.length).merge()
      .setValue(title).setBackground("#01696F").setFontColor("#FFFFFF")
      .setFontWeight("bold").setHorizontalAlignment("center");
    var hRow = ws.getRange(2,1,1,headers.length);
    hRow.setValues([headers]).setBackground("#01696F")
      .setFontColor("#FFFFFF").setFontWeight("bold");
    ws.setFrozenRows(2);
    ws.setColumnWidths(1, headers.length, 160);
  }

  makeSheet("Bookings","HomeServe — Bookings",
    ["Booking ID","Customer Name","Phone","Service","Date","Time Slot","Address","Provider","Status","Payment","Amount","Commission","Notes","Created"]);
  makeSheet("Providers","HomeServe — Providers",
    ["Provider ID","Name","Phone","Skill","City","KYC","Status","Rating","Jobs Done","Registered"]);
  makeSheet("Issues","HomeServe — Issues",
    ["Issue ID","Booking ID","Customer","Description","Raised On","Assigned To","Priority","Status","Resolution","Resolved On"]);
  makeSheet("Services","HomeServe — Services",
    ["Service ID","Category","Description","Base Price","Duration","Status"]);

  // Seed providers
  var pw = ss.getSheetByName("Providers");
  var providers = [
    ["PR-001","Naresh Chandra","9111122223","Plumbing","Vijayawada","Verified","Active",4.8,85,"01-Jan-2026"],
    ["PR-002","Priya Lakshmi","9222233334","Home Cleaning","Vijayawada","Verified","Active",4.9,120,"01-Jan-2026"],
    ["PR-003","Mahesh Kumar","9333344445","Electrical","Vijayawada","Verified","Active",4.7,64,"01-Feb-2026"],
    ["PR-004","Raju Babu","9444455556","Pest Control","Vijayawada","Pending","Under Review",0,0,"11-May-2026"],
    ["PR-005","Arjun Reddy","9555566667","AC Service","Vijayawada","Verified","Active",4.6,42,"01-Mar-2026"]
  ];
  providers.forEach(function(r){ pw.appendRow(r); });

  // Seed services
  var sw = ss.getSheetByName("Services");
  var services = [
    ["SVC-01","Home Cleaning","Full deep clean bathroom and kitchen","1200","2-3 hrs","Active"],
    ["SVC-02","Plumbing","Tap leaks pipe repair motor fitting","400","1 hr","Active"],
    ["SVC-03","Electrical","Switches fans wiring inverter","350","1 hr","Active"],
    ["SVC-04","Carpentry","Furniture assembly hinge repair","500","1-2 hrs","Active"],
    ["SVC-05","AC & Appliance","AC service washing machine fridge","700","1-2 hrs","Active"],
    ["SVC-06","Pest Control","Cockroach mosquito termite treatment","900","2 hrs","Active"],
    ["SVC-07","Painting","Wall painting touch-up full repaint","2500","4-8 hrs","Active"],
    ["SVC-08","Water Tank Cleaning","Tank cleaning and disinfection","800","2 hrs","Active"]
  ];
  services.forEach(function(r){ sw.appendRow(r); });

  Logger.log("Sheets created and seeded successfully!");
}
