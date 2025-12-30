// DB
const dbName = "PTDB18";
const version = 1;
var db;

// var object store;
var prayingTimeStore = "prayingTimeTables";
var defaultLocationStore = "defaultLocation";
var locationStore = "locations";

// location
var currentLocation = "";

$(document).ready(function () {
  // initiate DB
  const DBOpenRequest = window.indexedDB.open(dbName, version);

  // Register two event handlers to act on the database being opened successfully, or not
  DBOpenRequest.onerror = (event) => {
    console.log("Error loading database.");
  };

  DBOpenRequest.onsuccess = (event) => {
    // Store the result of opening the database in the db variable
    db = event.target.result;

    confirmDefaultLocation(() => {
      viewAllLocations(viewPrayingTables);
    });
  };

  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    console.log(db);

    db.onerror = (event) => {
      console.log("Error loading database.");
    };

    // Create an objectStore for this database
    if (!db.objectStoreNames.contains(locationStore)) {
      objectStore = db.createObjectStore(locationStore, { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains(defaultLocationStore)) {
      objectStore = db.createObjectStore(defaultLocationStore, { keyPath: "defaultLocation" });
    }

    if (!db.objectStoreNames.contains(prayingTimeStore)) {
      objectStore = db.createObjectStore(prayingTimeStore, { keyPath: "key" });
      // create index for searching purpose
      objectStore.createIndex("kabko_idx", "kabko");
    }
  };

  function confirmDefaultLocation(callback) {
    // if default location not set, set it first
    let objStore = db.transaction(defaultLocationStore, "readwrite").objectStore(defaultLocationStore);
    let defLocReq = objStore.getAll();

    defLocReq.onsuccess = function () {
      if (defLocReq.result.length === 0) {
        // default location not exist. select it first before proceeding
        currentLocation = "KOTA TANGERANG SELATAN";
        let addReq = objStore.add({ defaultLocation: currentLocation });
        addReq.onsuccess = function () {
          console.log("default location added");
          callback();
        };
      } else {
        currentLocation = defLocReq.result[0].defaultLocation;
        callback();
      }
    };
  }

  function viewAllLocations(callback) {
    // assumption: current and default location has been already set
    // check all location from DB, download if not yet exist

    let locReq;
    locReq = db.transaction(locationStore, "readonly").objectStore(locationStore).getAll();

    locReq.onsuccess = function () {
      if (locReq.result.length === 0) {
        // download all locations
        downloadAllLocations(() => {
          viewAllLocations(callback);
        });
      } else {
        let locList = "";
        locReq.result.forEach(function (element) {
          if (currentLocation === element.lokasi) {
            locList += "<option value=" + element.id + " selected>" + element.lokasi + "</option>";
          } else {
            locList += "<option value=" + element.id + ">" + element.lokasi + "</option>";
          }
        });
        $("#locationList").html(locList);
        callback();
      }
    };
  }

  function viewPrayingTables() {
    // assumption: current location has been already set
    let html = "";
    let reqPT = db.transaction(prayingTimeStore, "readonly").objectStore(prayingTimeStore).index("kabko_idx").getAll(currentLocation);

    reqPT.onsuccess = function () {
      if (reqPT.result.length === 0) {
        $("#prayingTableCaption").html("Klik Sinkronisasi Data untuk mendownload data");
      } else {
        // show data in tables based on location

        reqPT.result.forEach(function (element) {
          html += "<tr><th scope='row'>" + element.date + "</th><td>" + element.subuh + "</td><td>" + element.zuhur + "</td><td>" + element.ashar + "</td><td>" + element.magrib + "</td><td>" + element.isya + "</td></tr>";
        });

        $("#prayingTableCaption").html("");
      }
      $("#prayingTimeTables").html(html);
    };
  }

  function updateDefaultLocation(defLoc, callback) {
    let objStore = db.transaction(defaultLocationStore, "readwrite").objectStore(defaultLocationStore);
    let NewDefLoc = { defaultLocation: defLoc };
    let reqAdd = objStore.clear();
    reqAdd = objStore.add(NewDefLoc);

    reqAdd.onsuccess = function (ev) {
      callback();
    };
  }

  $("#locationList").on("change", function () {
    let loc = $("#locationList option:selected").text();

    if ($("#locationList option:selected").text() !== "Select New Location") {
      // set new default location
      currentLocation = loc;
      updateDefaultLocation(loc, viewPrayingTables);
    }
  });

  async function downloadAllLocations(callback) {
    try {
      let url = "https://api.myquran.com/v3/sholat/kabkota/semua";
      const response = await fetch(url);
      const data = await response.json();

      let newLocationData = new Object();
      let req;
      objectStore = db.transaction(locationStore, "readwrite").objectStore(locationStore);

      data.data.forEach((element) => {
        newLocationData = {
          id: element.id,
          lokasi: element.lokasi,
        };
        // add to DB
        req = objectStore.put(newLocationData);
      });

      req.onsuccess = function () {
        console.log("put success");
        callback();
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }

  $("#syncDataBtn").click(function () {
    if ($("#locationList option:selected").text() === "Select New Location") {
      alert("Please select new location");
    } else {
      // location id
      let locId = $("#locationList option:selected").attr("value");

      // download new praying time tables in 1 year
      downloadPrayingTimeTables(locId, viewPrayingTables);
    }
  });

  async function downloadPrayingTimeTables(locId, callback) {
    try {
      // set time range for 1 year from now
      // get current year and month
      const currentDate = new Date();
      const currentTime = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate() + " " + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

      let year = currentDate.getFullYear();
      let month = currentDate.getMonth() + 1;
      let req;

      for (let i = 1; i <= 12; i++) {
        // console.log(getPreformattedDate(year, month));

        // download data per month from API
        let url = "https://api.myquran.com/v3/sholat/jadwal/" + locId + getPreformattedDate(year, month);
        const response = await fetch(url);
        const data = await response.json();

        let dataPT = new Object();

        objectStore = db.transaction(prayingTimeStore, "readwrite").objectStore(prayingTimeStore);

        for (const [key, value] of Object.entries(data.data.jadwal)) {
          dataPT = {
            key: data.data.kabko + key,
            timestamp: currentTime,
            kabko: data.data.kabko,
            date: key,
            subuh: value.subuh,
            zuhur: value.dzuhur,
            ashar: value.ashar,
            magrib: value.maghrib,
            isya: value.isya,
          };

          // save praying time data to DB
          req = objectStore.add(dataPT);
        }

        // calculate next month
        if (month < 12) {
          month++;
        } else {
          year++;
          month = 1;
        }
      }

      // download the data from API

      req.onsuccess = function () {
        callback();
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function getPreformattedDate(year, month) {
    let monthStr;
    if (month < 10) {
      monthStr = "0" + month;
    } else {
      monthStr = month;
    }
    return "/" + year + "-" + monthStr;
  }

  $("#clearPrayingTable").click(function () {
    let req;
    req = db.transaction(prayingTimeStore, "readwrite").objectStore(prayingTimeStore).clear();
    req.onsuccess = function () {
      $("#prayingTimeTables").html("");
      $("#prayingTableCaption").html("Klik Sinkronisasi Data untuk mendownload data");
    };
  });
});
