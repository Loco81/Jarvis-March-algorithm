VanillaTilt.init(document.querySelectorAll(".card"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": .5
});



const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function parsePointsInput(input) {
  return input.split(" ").map(point => {
    let [x, y] = point.split(",").map(Number);
    return { x, y };
  }).filter(p => !isNaN(p.x) && !isNaN(p.y));
}

function getBoundingBox(points) {
  let minX = Math.min(...points.map(p => p.x));
  let minY = Math.min(...points.map(p => p.y));
  let maxX = Math.max(...points.map(p => p.x));
  let maxY = Math.max(...points.map(p => p.y));
  return { minX, minY, maxX, maxY };
}

function normalizePoints(points, canvasWidth, canvasHeight) {
  let { minX, minY, maxX, maxY } = getBoundingBox(points);
  let scaleX = canvasWidth / (maxX - minX || 1);
  let scaleY = canvasHeight / (maxY - minY || 1);
  let scale = Math.min(scaleX, scaleY) * 0.8;

  return points.map(p => ({
    x: (p.x - minX) * scale + (canvasWidth * 0.1),
    y: (p.y - minY) * scale + (canvasHeight * 0.1)
  }));
}

// الگوریتم جارویس مارچ (Gift Wrapping)
function jarvisMarch(points) {
  if (points.length < 3) return [];

  const leftmost = points.reduce((min, p) => (p.x < min.x ? p : min), points[0]);
  const hull = [];
  let current = leftmost;

  do {
    hull.push(current);
    let next = points[0];

    for (let i = 1; i < points.length; i++) {
      if (next === current) {
        next = points[i];
        continue;
      }

      const cross = (next.x - current.x) * (points[i].y - current.y) -
                    (next.y - current.y) * (points[i].x - current.x);

      if (cross < 0 || (cross === 0 && distance(current, points[i]) > distance(current, next))) {
        next = points[i];
      }
    }

    current = next;
  } while (current !== hull[0]);

  return hull;
}

function distance(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function drawPointsAndHull(ctx, points, hull) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // رسم تمام نقاط با رنگ قرمز
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  });

  // رسم پوش محدب با خطوط سفید
  if (hull.length > 1) {
    hull.reverse(); 
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    for (let i = 1; i < hull.length; i++) {
      ctx.lineTo(hull[i].x, hull[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    document.getElementById("isInBtn").classList.add("yes");
    document.getElementById("isInValue").textContent = "done";
  }
  else {
    document.getElementById("isInBtn").classList.remove("yes");
    document.getElementById("isInValue").textContent = "wrong input";
  }

  // شماره‌گذاری ترتیب رئوس
  ctx.fillStyle = 'orange';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  hull.forEach((p, i) => {
    ctx.save();
  
    // انتقال به موقعیت عدد
    ctx.translate(p.x + 6, p.y + 6);
  
    // معکوس کردن محور y
    ctx.scale(1, -1);
  
    if(i+1 == hull.length)
    {
      ctx.fillText((i + 2 - hull.length).toString(), 0, 0);
    }
    else {
      ctx.fillText((i + 2).toString(), 0, 0);
    }
  
    ctx.restore();
  });
}

function handleInput() {
  let input = document.getElementById("input1").value;
  let rawPoints = parsePointsInput(input);
  if (rawPoints.length === 0) return;

  let normPoints = normalizePoints(rawPoints, canvas.width, canvas.height);
  let hull = jarvisMarch(normPoints);
  drawPointsAndHull(ctx, normPoints, hull);
}

function resizeCanvas() {
  const card2 = document.querySelector('.card2');
  const canvas = document.getElementById('canvas');

  canvas.width = card2.clientWidth;
  canvas.height = card2.clientHeight;

  handleInput();
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);