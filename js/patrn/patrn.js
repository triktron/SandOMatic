var paterns = [], pageLoaded = false, paternsLoaded = false;

fetch("patrns/paterns.json")
  .then(response => response.json())
  .then(async data => {

    for (var patname of data) {
      var pat = new Patrn();
      await pat.Load(patname);
      paterns.push(pat);
    }

    if (pageLoaded) {
      addPaterns();
    } else {
      paternsLoaded = true;
    }
  });

window.addEventListener("load", () => {
  console.log("starting");
  pageLoaded = true;

  if (paternsLoaded) {
    addPaterns();
  }


      document.querySelector(".blur-overlay").addEventListener('click', unquickview);

});

function addPaterns() {
  for (var index in paterns) {
    var container = document.createElement("div");
    container.className = "pure-u-1-4 pure-u-lg-1-5";

    var arrayBufferView = new Uint8Array( paterns[index].Thumbnail );
      var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL( blob );
      var img = document.createElement("img");
      img.src = imageUrl;
      img.className = "pure-img";
      img.setAttribute("patern-index", index);
      img.addEventListener('click', quickview);
      container.appendChild(img);
      document.querySelector(".pure-g").appendChild(container);
  }
}

function quickview(e) {
  //e.target.classList.add("quickview");
  document.querySelector(".quickview").classList.add("open");
  document.querySelector(".blur").classList.add("active");
  document.querySelector(".quickview img").src = e.target.src;
  document.querySelector(".quickview .name").innerText = paterns[e.target.getAttribute("patern-index")].Name;
  document.querySelector(".quickview").setAttribute("patern-index", e.target.getAttribute("patern-index"))
}

function unquickview(e) {
  document.querySelector(".quickview").classList.remove("open");
  document.querySelector(".blur").classList.remove("active");
  StopSimulation();
}

async function StartSimulation() {
  var container = document.querySelector(".quickview");

  window.simulator = new Simulator(container);
  simulator.DrawArms();
  simulator.Play(paterns[container.getAttribute("patern-index")])
}

function StopSimulation() {
  var container = document.querySelector(".quickview");
  if (typeof simulator !== 'undefined' && simulator !== null) {
    simulator.Stop();
    container.removeChild(simulator.armC);
    container.removeChild(simulator.tableC);
  }

  window.simulator = null;
}
