// DB
const dbName = "PTDB18";
const version = 1;
var db;

// object store;
var prayingTableStore = "prayingTimeTables";
var defaultLocationStore = "defaultLocation";
var locationStore = "locations";

// var prayTimeArr = [];
var locationByDefault = "KOTA TANGERANG SELATAN";

$(document).ready(function () {
  const DBOpenRequest = window.indexedDB.open(dbName, version);

  // Register two event handlers to act on the database being opened successfully, or not
  DBOpenRequest.onerror = (event) => {
    console.log("Error loading database.");
  };

  DBOpenRequest.onsuccess = async function (event) {
    console.log("Database initialised.");

    // Store the result of opening the database in the db variable. This is used a lot below
    db = event.target.result;

    db.onerror = (event) => {
      // Generic error handler for all errors targeted at this database's
      // requests!
      console.error(`Database error: ${event.target.error?.message}`);
    };

    let req;
    req = await db.transaction(defaultLocationStore, "readonly").objectStore(defaultLocationStore).getAll();

    req.onsuccess = function (ev) {
      if (ev.target.result.length === 0) {
        // default location not exist, redirect to config page
        alert("default location not exist. redirecting to configuration page.");
        window.location.replace("konfigurasi.html");
      } else {
        defLoc = ev.target.result[0].defaultLocation;
        // default location exist
        $(".location").text(ev.target.result[0].defaultLocation);
        showPrayingTimeToday();
        displayTime();
      }
    };
   
  };


  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;

    db.onerror = (event) => {
      console.log("Error loading database.");
    };

    // Create an objectStore for this database if not yet exist
    if (!db.objectStoreNames.contains(prayingTableStore)) {
      objectStore = db.createObjectStore(prayingTableStore, { keyPath: "key" });
      // create index for searching purpose
      objectStore.createIndex("kabko_idx", "kabko");
    }
    if (!db.objectStoreNames.contains(defaultLocationStore)) {
      objectStore = db.createObjectStore(defaultLocationStore, { keyPath: "defaultLocation" });
    }
    if (!db.objectStoreNames.contains(locationStore)) {
      objectStore = db.createObjectStore(locationStore, { keyPath: "id" });
    }
  };

});


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

function displayTime() {
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

function showPrayingTimeToday() {
  // default location
  let currentLocation;
  let locationReq;

  try {
    let trx = db.transaction(defaultLocationStore, "readonly");
    let objStore = trx.objectStore(defaultLocationStore);
    locationReq = objStore.getAll();

    locationReq.onsuccess = function () {
      if (locationReq.result.length === 0) {
        // default location not exist, redirect to config page
        alert("default location not exist. please download the data to automatically set default location. redirecting...");
        window.location.replace("konfigurasi.html");
      } else {
        // default location exist
        // console.log("default location exist. loading prayer times.");
        currentLocation = locationReq.result[0].defaultLocation;

        // generate key id
        let currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = function () {
          if (currentDate.getMonth() + 1 < 10) {
            return "0" + (currentDate.getMonth() + 1);
          } else {
            return currentDate.getMonth() + 1;
          }
        };
        const date = function () {
          if (currentDate.getDate() < 10) {
            return "0" + currentDate.getDate();
          } else {
            return currentDate.getDate();
          }
        };

        let keyId = currentLocation + year + "-" + month() + "-" + date();

        let reqStore = db.transaction(prayingTableStore, "readonly").objectStore(prayingTableStore);
        let prayTime = reqStore.get(keyId);

        prayTime.onsuccess = function () {
          if (prayTime.result !== undefined) {
            $("#subuhId").text(prayTime.result.subuh);
            $("#zuhurId").text(prayTime.result.zuhur);
            $("#asharId").text(prayTime.result.ashar);
            $("#magribId").text(prayTime.result.magrib);
            $("#isyaId").text(prayTime.result.isya);
          } else {
            alert("default location not exist. please download the data to automatically set default location. redirecting...");
            window.location.replace("konfigurasi.html");
          }
        };

        prayTime.onerror = function () {
          console.log("get praying time table result on error");
        };
      }
    };
  } catch (error) {
    console.log("catch error get default location");
  }
}
