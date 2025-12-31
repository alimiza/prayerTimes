// // DB
// const dbName = "PTDB18";
// const version = 1;
// var db;

// // object store;
// var prayingTableStore = "prayingTimeTables";
// var defaultLocationStore = "defaultLocation";
// var locationStore = "locations";

// var prayTimeArr = [];
var locationByDefault = "KOTA TANGERANG SELATAN";

$(document).ready(function () {
  initiateIDBforIndexPage();

  $(".location").click(function () {
    $("#modalConfig").modal("show");
  });

  // change theme by changing class in body element ----------------------
  function changeClass(newClass) {
    $("body").removeClass();
    $("body").addClass(newClass);
  }

  $("#ukhuwah").click(function () {
    changeClass("body-theme-ukhuwah");
  });

  $("#istiqlal").click(function () {
    changeClass("body-theme-istiqlal");
  });

  $("#zayed").click(function () {
    changeClass("body-theme-zayed");
  });

  $("#ic-kaltim").click(function () {
    changeClass("body-theme-ic-kaltim");
  });

  $("#baiturrahman-aceh").click(function () {
    changeClass("body-theme-baiturrahman-aceh");
  });
  // end of change theme by changing class in body element ----------------------

  
});

function renderPrayingTimeToday(PTArr) {
  $("#subuhId").text(PTArr.subuh);
  $("#zuhurId").text(PTArr.zuhur);
  $("#asharId").text(PTArr.ashar);
  $("#magribId").text(PTArr.magrib);
  $("#isyaId").text(PTArr.isya);

  decorateDisplayTime();
}

function redirectToConfigPage() {
  alert("default location not exist. please download the data to automatically set default location. redirecting...");
  window.location.replace("konfigurasi.html");
}



function decorateDisplayTime() {
  setInterval(function () {
    var current = new Date();

    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayName = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // show current date and time
    $(".current-time").text(current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds());
    $(".current-date").text(dayName[current.getDay()] + ", " + current.getDate() + " " + months[current.getMonth()] + " " + current.getFullYear());

    // check current praying time
    const subuhTimeText = $("#subuhId").text().split(":");
    var subuhTime = new Date();
    subuhTime.setHours(subuhTimeText[0], subuhTimeText[1], 0);

    const zuhurTimeText = $("#zuhurId").text().split(":");
    var zuhurTime = new Date();
    zuhurTime.setHours(zuhurTimeText[0], zuhurTimeText[1], 0);

    const asharTimeText = $("#asharId").text().split(":");
    var asharTime = new Date();
    asharTime.setHours(asharTimeText[0], asharTimeText[1], 0);

    const magribTimeText = $("#magribId").text().split(":");
    var magribTime = new Date();
    magribTime.setHours(magribTimeText[0], magribTimeText[1], 0);

    const isyaTimeText = $("#isyaId").text().split(":");
    var isyaTime = new Date();
    isyaTime.setHours(isyaTimeText[0], isyaTimeText[1], 0);

    var sunRiseTime = new Date();
    sunRiseTime.setHours(6, 0, 0);

    // check current praying time
    if (current >= subuhTime && current < sunRiseTime) {
      $(".subuh").removeClass("text-bg-light").addClass("text-bg-warning");
      $(".zuhur").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".ashar").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".magrib").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".isya").removeClass("text-bg-warning").addClass("text-bg-light");

      // show modal azan time
      if (current.getHours() === subuhTime.getHours() && current.getMinutes() === subuhTime.getMinutes() && current.getSeconds() === subuhTime.getSeconds()) {
        console.log("azan time: " + current);
        $("#modalAzanTime").modal("show");
        setTimeout(() => {
          $("#modalAzanTime").modal("hide");
        }, 5000);
      }
    } else if (current >= zuhurTime && current < asharTime) {
      $(".subuh").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".zuhur").removeClass("text-bg-light").addClass("text-bg-warning");
      $(".ashar").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".magrib").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".isya").removeClass("text-bg-warning").addClass("text-bg-light");

      // show modal azan time
      if (current.getHours() === zuhurTime.getHours() && current.getMinutes() === zuhurTime.getMinutes() && current.getSeconds() === zuhurTime.getSeconds()) {
        console.log("azan time: " + current);
        $("#modalAzanTime").modal("show");
        setTimeout(() => {
          $("#modalAzanTime").modal("hide");
        }, 5000);
      }
    } else if (current >= asharTime && current < magribTime) {
      $(".subuh").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".zuhur").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".ashar").removeClass("text-bg-light").addClass("text-bg-warning");
      $(".magrib").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".isya").removeClass("text-bg-warning").addClass("text-bg-light");

      // show modal azan time
      if (current.getHours() === asharTime.getHours() && current.getMinutes() === asharTime.getMinutes() && current.getSeconds() === asharTime.getSeconds()) {
        console.log("azan time: " + current);
        $("#modalAzanTime").modal("show");
        setTimeout(() => {
          $("#modalAzanTime").modal("hide");
        }, 5000);
      }
    } else if (current >= magribTime && current < isyaTime) {
      $(".subuh").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".zuhur").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".ashar").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".magrib").removeClass("text-bg-light").addClass("text-bg-warning");
      $(".isya").removeClass("text-bg-warning").addClass("text-bg-light");

      // show modal azan time
      //console.log(current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds() + " vs " + magribTime.getHours() + ":" + magribTime.getMinutes() + ":" + magribTime.getSeconds());
      if (current.getHours() === magribTime.getHours() && current.getMinutes() === magribTime.getMinutes() && current.getSeconds() === magribTime.getSeconds()) {
        console.log("azan magrib time: " + current);
        $("#modalAzanTime").modal("show");
        setTimeout(() => {
          $("#modalAzanTime").modal("hide");
        }, 5000);
      }
    } else if (current >= isyaTime) {
      $(".subuh").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".zuhur").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".ashar").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".magrib").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".isya").removeClass("text-bg-light").addClass("text-bg-warning");

      // show modal azan time
      //console.log(current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds() + " vs " + isyaTime.getHours() + ":" + isyaTime.getMinutes() + ":" + isyaTime.getSeconds());
      if (current.getHours() === isyaTime.getHours() && current.getMinutes() === isyaTime.getMinutes() && current.getSeconds() === isyaTime.getSeconds()) {
        console.log("azan isya time: " + current);
        $("#modalAzanTime").modal("show");
        setTimeout(() => {
          $("#modalAzanTime").modal("hide");
        }, 5000);
      }
    } else {
      $(".subuh").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".zuhur").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".ashar").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".magrib").removeClass("text-bg-warning").addClass("text-bg-light");
      $(".isya").removeClass("text-bg-warning").addClass("text-bg-light");
    }
  }, 1000);
}


