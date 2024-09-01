function setUp() {
  let setupContainer = document.getElementById("setup-container");
  setupContainer.style.display = "flex";
  let calculationMethods = [];
  fetch("http://api.aladhan.com/v1/methods")
    .then((response) => response.json())
    .then((data) => {
      data = data.data;
      // console.log(data);
      for (country in data) {
        //   console.log(data[country]);
        let obj = {
          name: data[country].name,
          id: data[country].id,
        };
        calculationMethods.push(obj);
      }
    })
    .then(() => {
      // console.log(calculationMethods);
      let select = document.getElementById("calculationMethods");
      for (let i = 0; i < 6; i++) {
        let option = document.createElement("option");
        option.value = calculationMethods[i].id;
        option.innerHTML = calculationMethods[i].name;
        if (
          localStorage.getItem("calculationMethod") == calculationMethods[i].id
        )
          option.selected = true;
        select.appendChild(option);
      }
    });

  fetch("https://countriesnow.space/api/v0.1/countries")
    .then((response) => response.json())
    .then((data) => {
      for (countryObj in data.data) {
        let option = document.createElement("option");
        option.value = data.data[countryObj].iso2;
        option.innerHTML = data.data[countryObj].country;
        if (localStorage.getItem("country") == data.data[countryObj].iso2)
          option.selected = true;
        document.getElementById("countries").appendChild(option);
      }
      return data;
    })
    .then((data) => {
      document.getElementById("countries").addEventListener("change", () => {
        updateCities(data);
      });
      updateCities(data);
    });

  function updateCities(data) {
    document.getElementById("cities").innerHTML = "";
    let country = document.getElementById("countries").value;
    for (countryObj in data.data) {
      // console.log(data.data[countryObj]);
      if (data.data[countryObj].iso2 == country) {
        data.data[countryObj].cities.forEach((city) => {
          let option = document.createElement("option");
          option.value = city;
          option.innerHTML = city;
          if (localStorage.getItem("city") == city) option.selected = true;
          document.getElementById("cities").appendChild(option);
        });

        break;
      }
    }
  }
  document.getElementById("save").addEventListener("click", () => {
    let calculationMethod = document.getElementById("calculationMethods").value;
    let country = document.getElementById("countries").value;
    let city = document.getElementById("cities").value;
    localStorage.setItem("city", city);
    localStorage.setItem("country", country);
    localStorage.setItem("calculationMethod", calculationMethod);
    // if(countdown)
    //   clearInterval(countdown);
    // loadData();
    window.location.reload();
    setupContainer.style.display = "none";
  });
}

let timings,
  fajr,
  dhuhr,
  asr,
  maghrib,
  isha,
  currentTime,
  setupButton = document.getElementById("settings"),
  countdown;
setupButton.onclick = function () {
  setUp();
};
if (
  localStorage.getItem("city") &&
  localStorage.getItem("country") &&
  localStorage.getItem("calculationMethod")
) {
  loadData();
} else {
  setupButton.click();
}

function loadData() {
  let calculationMethod = localStorage.getItem("calculationMethod");
  let country = localStorage.getItem("country");
  let city = localStorage.getItem("city");
  let url = `http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${calculationMethod}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      timings = data.data.timings;
      fajr = timings.Fajr;
      shrouq = timings.Sunrise;
      dhuhr = timings.Dhuhr;
      asr = timings.Asr;
      maghrib = timings.Maghrib;
      isha = timings.Isha;
      document.getElementById("fajr").innerHTML = formatTime(fajr);
      document.getElementById("shrouq").innerHTML = formatTime(shrouq);
      document.getElementById("dhuhr").innerHTML = formatTime(dhuhr);
      document.getElementById("asr").innerHTML = formatTime(asr);
      document.getElementById("maghrib").innerHTML = formatTime(maghrib);
      document.getElementById("isha").innerHTML = formatTime(isha);
    })
    .then(() => {
      document.getElementById("city").innerHTML = localStorage.getItem("city");
      let date = new Date();

      let year = convertToArabic(`${date.getFullYear()}`);
      let month = date.getMonth();
      let day = convertToArabic(`${date.getDate()}`);
      let weekday = date.getDay();
      let months = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ];
      let weekdays = [
        "السبت",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "الأحد",
      ];
      document.getElementById("year").innerHTML = year;
      document.getElementById("month").innerHTML = months[month - 1];
      document.getElementById("day").innerHTML = day;
      document.getElementById("weekday").innerHTML = weekdays[weekday];

      hours = date.getHours();

      minutes = date.getMinutes();
      seconds = date.getSeconds();
      apm = "ص";
      if (hours >= 12) {
        apm = "م";
      } else if (hours == 0) {
        hours = 12;
      }
      intervalFunction();
      countdown = setInterval(intervalFunction, 1000);
    });
}

function intervalFunction() {

    if (seconds == 59) {
      seconds = 0;
      if (minutes == 59) {
        minutes = 0;
        hours++;
        if (hours == 12) {
          apm == "ص" ? (apm = "م") : (apm = "ص");
        }
      } else {
        minutes++;
      }
    } else seconds++;
    if (hours > 12) {
      hours -= 12;
    }

    currentTimeSeconds =
      parseInt(seconds) +
      minutes * 60 +
      (apm == "ص" ? (hours == 12 ? 0 : hours * 3600) : (12 + hours) * 3600);

    remainingTime = getRemainingTime(currentTimeSeconds);

    hoursInArabic = convertToArabic(`${hours}`);
    minutesInArabic = convertToArabic(`${minutes}`);
    secondsInArabic = convertToArabic(`${seconds}`);
    if (`${minutesInArabic}`.length == 1)
      minutesInArabic = `٠${minutesInArabic}`;
    if (`${secondsInArabic}`.length == 1)
      secondsInArabic = `٠${secondsInArabic}`;
    document.getElementById("hours").innerHTML = hoursInArabic;
    document.getElementById("minutes").innerHTML = minutesInArabic;
    document.getElementById("seconds").innerHTML = secondsInArabic;
    document.getElementById("apm").innerHTML = apm;
    document.getElementById("remaining").innerHTML = remainingTime;
    // document.getElementById("date").innerHTML =`<span style = "min-width: 150px;">${seconds} : ${minutes} : ${hours}</span> <sub>${apm}</sub>`;
  
}


function formatTime(time) {
  let timeArr = time.split(":");
  let hour = parseInt(timeArr[0]);
  let min = timeArr[1];
  let apm = "ص";
  if (hour >= 12) {
    apm = "م";
    if (hour > 12) {
      hour -= 12;
    }
  }
  if (hour == 0) hour = 12;

  hour = convertToArabic(`${hour}`);
  min = convertToArabic(`${min}`);
  str = `${min} : ${hour} <sub>${apm}</sub>`;
  return str;
}

function convertToArabic(str) {
  str = `${str}`;
  let arabicNum = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  for (let i = 0; i < 10; i++) {
    str = str.replaceAll(i, arabicNum[i]);
  }

  return str;
}

function getRemainingTime(currentTime) {
  let nextPrayer, remainingTime;
  if (currentTime < convertToSeconds(fajr)) {
    nextPrayer = "أذان الفجر";
    remainingTime = convertToSeconds(fajr) - currentTime;
  } else if (currentTime < convertToSeconds(shrouq)) {
    nextPrayer = "الشروق";
    remainingTime = convertToSeconds(shrouq) - currentTime;
  } else if (currentTime < convertToSeconds(dhuhr)) {
    nextPrayer = "أذان الظهر";
    remainingTime = convertToSeconds(dhuhr) - currentTime;
  } else if (currentTime < convertToSeconds(asr)) {
    nextPrayer = "أذان العصر";
    remainingTime = convertToSeconds(asr) - currentTime;
  } else if (currentTime < convertToSeconds(maghrib)) {
    nextPrayer = "أذان المغرب";
    remainingTime = convertToSeconds(maghrib) - currentTime;
  } else if (currentTime < convertToSeconds(isha)) {
    nextPrayer = "أذان العشاء";
    remainingTime = convertToSeconds(isha) - currentTime;
  } else {
    nextPrayer = "أذان الفجر";
    remainingTime = 24 * 3600 - currentTime + convertToSeconds(fajr);
  }
  let hours = Math.floor(remainingTime / 3600);
  let minutes = Math.floor((remainingTime - hours * 3600) / 60);
  let seconds = remainingTime - hours * 3600 - minutes * 60;

  if(`${minutes}`.length == 1) minutes = `0${minutes}`;
  if(`${seconds}`.length == 1) seconds = `0${seconds}`;
  hours == 0
    ? (remainingTime = `${seconds} : ${minutes}`)
    : (remainingTime = `${seconds} : ${minutes} : ${hours}`);
  remainingTime = convertToArabic(remainingTime);
  return `<span>تبقى</span><span style = "text-align: center;">${remainingTime}</span><span> على ${nextPrayer}</span>`;
}
function convertToSeconds(time) {
  let timeArr = time.split(":");
  let hour = parseInt(timeArr[0]);
  let min = parseInt(timeArr[1]);

  return hour * 3600 + min * 60;
}
