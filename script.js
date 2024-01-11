const file = document.getElementById("fileupload");
const canvas = document.getElementById("canvas");
const audio = document.getElementById("audio");
const switcher = document.getElementById("switcher");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let typeVisualizer = "bar";
let analyzer;

const playVisualizer = () => {
  if (typeVisualizer === "circle") return cicleVisualizer();
  barVisualizer();
};

// type switch
switcher.addEventListener("change", (e) => {
  const type = e.target.value;
  typeVisualizer = type;

  playVisualizer();
});

file.addEventListener("change", function (e) {
  // load audio
  const files = e.target.files;
  audio.src = URL.createObjectURL(files[0]);
  audio.load();
  audio.play();

  // prepare analyzer and it analyze by ownself
  const actx = new AudioContext();
  const audioSrc = actx.createMediaElementSource(audio);
  analyzer = actx.createAnalyser();
  audioSrc.connect(analyzer);
  analyzer.connect(actx.destination);

  playVisualizer();
});

function barVisualizer() {
  canvas.classList.remove("circle");

  analyzer.fftSize = 128;
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const barWidth = canvas.width / 2 / bufferLength;

  // draw
  const animate = () => {
    if (typeVisualizer !== "bar") return;
    let x = 0;
    let barHeigh;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    analyzer.getByteFrequencyData(dataArray);
    drawBarVisualizer(bufferLength, x, barWidth, barHeigh, dataArray);
    requestAnimationFrame(animate);
  };
  animate();
}

function drawBarVisualizer(bufferLength, x, barWidth, barHeigh, dataArray) {
  const getBarColor = (i) => {
    const red = (i * barHeigh) / 20;
    const green = i * 4;
    const blue = barHeigh / 2;

    return `rgb(${red}, ${green}, ${blue})`;
  };

  const drawBar = (xPos, i) => {
    // set height of bar
    barHeigh = dataArray[i];

    // set color
    ctx.fillStyle = getBarColor(i);

    ctx?.fillRect(xPos, canvas.height - barHeigh, barWidth, barHeigh);
  };

  const drawHead = (xPos) => {
    // set color
    ctx.fillStyle = "white";

    ctx?.fillRect(xPos, canvas.height - barHeigh - 20, barWidth, 10);
  };

  for (let i = 0; i < bufferLength; i++) {
    const xPos = canvas.width / 2 - x;

    // draw bar
    drawBar(xPos, i);

    // draw bar head
    drawHead(xPos);

    // move to next bar
    x += barWidth;
  }

  for (let i = 0; i < bufferLength; i++) {
    // draw bar
    drawBar(x, i);

    // draw bar head
    drawHead(x);

    // move to next bar
    x += barWidth;
  }
}

function cicleVisualizer() {
  canvas.classList.add("circle");

  analyzer.fftSize = 512;
  const bufferLength = analyzer.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const barWidth = 15;

  // draw
  const animate = () => {
    if (typeVisualizer !== "circle") return;

    let x = 0;
    let barHeigh;
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    analyzer.getByteFrequencyData(dataArray);
    drawCirlcleVisualizer(bufferLength, x, barWidth, barHeigh, dataArray);
    requestAnimationFrame(animate);
  };
  animate();
}

function drawCirlcleVisualizer(bufferLength, x, barWidth, barHeigh, dataArray) {
  const move2CenterAndRotate = (i) => {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(i + (Math.PI * 8) / bufferLength);
  };

  const getBarColor = (i) => {
    const hue = i;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const drawBar = (i) => {
    // set height of bar
    barHeigh = dataArray[i];

    // set color
    ctx.fillStyle = getBarColor(i);

    ctx?.fillRect(0, 0, barWidth, barHeigh);
  };

  for (let i = 0; i < bufferLength; i++) {
    ctx.save();

    move2CenterAndRotate(i);

    // draw bar
    drawBar(i);

    // move to next bar
    x += barWidth;

    ctx.restore();
  }
}
