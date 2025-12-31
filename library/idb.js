// DB
const dbName = "PTDB";
const version = 1;
var db;

// var object store;
var prayingTimeStore = "prayingTimeTables";
var defaultLocationStore = "defaultLocation";
var locationStore = "locations";

// location
var currentLocation = "";

function initiateIDBforIndexPage() {
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
        getPrayingTimeToday((prayTimeArr) => {
          renderPrayingTimeToday(prayTimeArr);
        });
        
      }
    };
  };
  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    db.onerror = (event) => {
      console.log("Error loading database.");
    };
    // Create an objectStore for this database if not yet exist
    if (!db.objectStoreNames.contains(prayingTimeStore)) {
      objectStore = db.createObjectStore(prayingTimeStore, { keyPath: "key" });
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
}

function initiateIDBforConfigPage() {
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
      viewAllLocations((locs) => {
        // render all locations
        renderLocations(locs);

        // render praying time tables
        getPrayingTimeTable(viewPrayingTimeTables);
      });
    });
  };

  DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;

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
}

function getPrayingTimeToday(callback) {
  // default location
  let locationReq;

  try {
    let trx = db.transaction(defaultLocationStore, "readonly");
    let objStore = trx.objectStore(defaultLocationStore);
    locationReq = objStore.getAll();

    locationReq.onsuccess = function () {
      if (locationReq.result.length === 0) {
        // default location not exist, redirect to config page
        redirectToConfigPage();
      } else {
        // default location exist
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

        let reqStore = db.transaction(prayingTimeStore, "readonly").objectStore(prayingTimeStore);
        let prayTime = reqStore.get(keyId);

        prayTime.onsuccess = function () {
          if (prayTime.result !== undefined) {
            // render praying time today
            callback(prayTime.result);
            // renderPrayingTimeToday(prayTime.result);
          } else {
            redirectToConfigPage();
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
      //   let locList = "";
      //   locReq.result.forEach(function (element) {
      //     if (currentLocation === element.lokasi) {
      //       locList += "<option value=" + element.id + " selected>" + element.lokasi + "</option>";
      //     } else {
      //       locList += "<option value=" + element.id + ">" + element.lokasi + "</option>";
      //     }
      //   });
      //   $("#locationList").html(locList);
      callback(locReq.result);
    }
  };
}

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

function getPrayingTimeTable(callback) {
  let reqPT = db.transaction(prayingTimeStore, "readonly").objectStore(prayingTimeStore).index("kabko_idx").getAll(currentLocation);
  reqPT.onsuccess = function () {
    callback(reqPT.result);
  };
}
