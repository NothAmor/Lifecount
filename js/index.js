var yearlen = 365.24;
var dayinms = 86400000; // No. seconds in a day = 24h*60m*60s = 86400s = 86400000ms

// Utility functions

function calcExpectedDeathDate(birthday, expectancyNow) {
  var result = new Date(birthday);
  result.setDate(result.getDate() + expectancyNow * yearlen);
  return result;
}

function calcLifeFraction(birthday, deathday) {
  var birthTime = birthday.getTime();
  var deathTime = deathday.getTime();
  return (new Date().getTime() - birthTime) / (deathTime - birthTime);
}

function calcLifeDays(birthday) {
  var birthTime = birthday.getTime();
  var now = Date.now();
  var timezoneOffset = birthday.getTimezoneOffset() * 60 * 1000; // Timezone offset in ms
  var timediff = now - birthTime - timezoneOffset;
  return timediff / dayinms;
}

function calcDaysLeft(deathday) {
  var now = Date.now();
  var timezoneOffset = deathday.getTimezoneOffset() * 60 * 1000; // Timezone offset in ms
  var timediff = deathday.getTime() - now - timezoneOffset;
  return timediff / dayinms;
}

function supportsLocalStorage() {
  return typeof Storage !== "undefined";
}

// Rendering

function renderNoOutput() {
  $("#predictions").text("");
}

function renderOutput(lifeDays, deathday, daysLeft, lifePercentage) {
  var textHtml =
    "您已经在这世上过了<h2>" +
    lifeDays.toFixed(5) +
    " 天了</h2>" +
    "按照您的预期您可能会在<h2>" +
    deathday.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) +
    "</h2>死去" +
    "<br>还剩下<h2>" +
    daysLeft.toFixed(5) +
    "</h2><br>粗略地估计大概已经活了<h2>" +
    lifePercentage.toFixed(8) +
    "%</h2>";
  $("#predictions").html(textHtml);
}

function calculateAndRender() {
  // Obtain input
  var birthdayStr = $("#birthdayInput").val();
  var expectancyNow = $("#lifeExpectancyInput").val();
  var birthday = birthdayStr ? new Date(birthdayStr) : null;

  // Save input
  if (supportsLocalStorage()) {
    localStorage.setItem("birthdayStr", birthdayStr);
    localStorage.setItem("expectancyNow", expectancyNow);
  }

  // Abort if input is bad
  if (!birthday || !expectancyNow || expectancyNow <= 0) {
    renderNoOutput();
    return;
  }

  // Calculate
  var deathday = calcExpectedDeathDate(birthday, expectancyNow);
  var lifePercentage = calcLifeFraction(birthday, deathday) * 100;
  var lifeDays = calcLifeDays(birthday);
  var daysLeft = calcDaysLeft(deathday);

  // Abort if output is bad
  if (!deathday || !lifePercentage || !lifeDays || !daysLeft) {
    renderNoOutput();
    return;
  }

  // Display
  renderOutput(lifeDays, deathday, daysLeft, lifePercentage);
}

// Initializers and watchers

if (supportsLocalStorage()) {
  $("#birthdayInput").val(localStorage.getItem("birthdayStr"));
  $("#lifeExpectancyInput").val(localStorage.getItem("expectancyNow"));
}

calculateAndRender(); // Initial render for when data was stored

$("#birthdayInput").on("input", calculateAndRender);
$("#lifeExpectancyInput").on("input", calculateAndRender);
setInterval(calculateAndRender, dayinms / 100000); // Every 0.00001 day in ms
