function onOpenCvReady() {
  document.body.classList.remove('loading');
  document.getElementById('content').classList.remove('hidden');
}

let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

inputElement.onchange = function() {
  imgElement.src = URL.createObjectURL(event.target.files[0]);
};

imgElement.onload = function() {
  let image = cv.imread(imgElement);
  cv.imshow('imageCanvas', image);
  image.delete();
};

document.getElementById('circlesButton').onclick = function() {
  // disable page
  this.disabled = true;
  document.body.classList.add('loading');

  // circle detection code
  let srcMat = cv.imread('imageCanvas');
  let displayMat = srcMat.clone();
  let circlesMat = new cv.Mat();

  cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY); // convert to grayscale
  cv.HoughCircles(srcMat, circlesMat, cv.HOUGH_GRADIENT, 1, 45, 75, 40, 0, 0); // detect circles

  // draw circles
  for (let i = 0; i < circlesMat.cols; ++i) {
    let x = circlesMat.data32F[i * 3];
    let y = circlesMat.data32F[i * 3 + 1];
    let radius = circlesMat.data32F[i * 3 + 2];
    let center = new cv.Point(x, y);
    cv.circle(displayMat, center, radius, [0, 0, 0, 255], 3);
  }

  cv.imshow('imageCanvas', displayMat); // display the circles

  // cleanup
  srcMat.delete();
  displayMat.delete();
  circlesMat.delete();

  // reenable page
  this.disabled = false;
  document.body.classList.remove('loading');
};

let debounceDownload = false;
document.getElementById('downloadButton').onclick = function() {
  if (!debounceDownload) {
    debounceDownload = true;
    setTimeout(() => {
      debounceDownload = false;
    }, 100);

    this.href = document.getElementById('imageCanvas').toDataURL();
    this.download = 'image.png';
  }
};