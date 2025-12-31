$(document).ready(function () {
  initiateIDBforConfigPage();

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
      updateDefaultLocation(loc, () => {
        getPrayingTimeTable(viewPrayingTimeTables);
      });
    }
  });

  $("#syncDataBtn").click(function () {
    if ($("#locationList option:selected").text() === "Select New Location") {
      alert("Please select new location");
    } else {
      // location id
      let locId = $("#locationList option:selected").attr("value");

      // download new praying time tables in 1 year
      // downloadPrayingTimeTables(locId, viewPrayingTables);
      downloadPrayingTimeTables(locId, () => {
        getPrayingTimeTable(viewPrayingTimeTables);
      });
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

function viewPrayingTimeTables(PTArr) {
  // assumption: current location has been already set
  let html = "";

  if (PTArr.length === 0) {
    $("#prayingTableCaption").html("Klik Sinkronisasi Data untuk mendownload data");
  } else {
    // show data in tables based on location

    PTArr.forEach(function (element) {
      html += "<tr><th scope='row'>" + element.date + "</th><td>" + element.subuh + "</td><td>" + element.zuhur + "</td><td>" + element.ashar + "</td><td>" + element.magrib + "</td><td>" + element.isya + "</td></tr>";
    });

    $("#prayingTableCaption").html("");
  }
  $("#prayingTimeTables").html(html);
}

function renderLocations(locArr) {
  let locList = "";
  locArr.forEach(function (element) {
    if (currentLocation === element.lokasi) {
      locList += "<option value=" + element.id + " selected>" + element.lokasi + "</option>";
    } else {
      locList += "<option value=" + element.id + ">" + element.lokasi + "</option>";
    }
  });
  $("#locationList").html(locList);
}