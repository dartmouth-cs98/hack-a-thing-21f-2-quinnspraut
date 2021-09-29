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

  document.getElementById('circlesButton').classList.add('enabled');
  document.getElementById('downloadButton').classList.remove('enabled');
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
  document.getElementById('downloadButton').classList.add('enabled');
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

let switchBtn = document.getElementById('switch-btn')
switchBtn.onclick = function() {
  if (switchBtn.textContent == 'Face Detector') {
    switchBtn.textContent = 'Circle Detector';
    document.getElementById('content').classList.add('hidden');
    document.getElementById('face-content').classList.remove('hidden');
  } else {
    switchBtn.textContent = 'Face Detector';
    document.getElementById('content').classList.remove('hidden');
    document.getElementById('face-content').classList.add('hidden');
  }
}

// face detection

let faceImgElement = document.getElementById('face-imageSrc');
let faceInputElement = document.getElementById('face-fileInput');

faceInputElement.onchange = function() {
  faceImgElement.src = URL.createObjectURL(event.target.files[0]);
};

faceImgElement.onload = function() {
  let image = cv.imread(faceImgElement);
  cv.imshow('face-imageCanvas', image);
  image.delete();

  document.getElementById('faceButton').classList.add('enabled');
  document.getElementById('face-downloadButton').classList.remove('enabled');
};

document.getElementById('faceButton').onclick = function() {
  // disable page
  this.disabled = true;
  document.body.classList.add('loading');

  // circle detection code
  let src = cv.imread('face-imageCanvas');
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  let faces = new cv.RectVector();
  let eyes = new cv.RectVector();
  let faceCascade = new cv.CascadeClassifier();
  let eyeCascade = new cv.CascadeClassifier();
  // load pre-trained classifiers
  faceCascade.load('./haarcascade_frontalface_default.xml');
  eyeCascade.load('./haarcascade_eye.xml');
  // detect faces
  let msize = new cv.Size(0, 0);
  faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
  for (let i = 0; i < faces.size(); ++i) {
      let roiGray = gray.roi(faces.get(i));
      let roiSrc = src.roi(faces.get(i));
      let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
      let point2 = new cv.Point(faces.get(i).x + faces.get(i).width,
                                faces.get(i).y + faces.get(i).height);
      cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
      // detect eyes in face ROI
      eyeCascade.detectMultiScale(roiGray, eyes);
      for (let j = 0; j < eyes.size(); ++j) {
          let point1 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
          let point2 = new cv.Point(eyes.get(j).x + eyes.get(j).width,
                                    eyes.get(j).y + eyes.get(i).height);
          cv.rectangle(roiSrc, point1, point2, [0, 0, 255, 255]);
      }
      roiGray.delete(); roiSrc.delete();
  }
  cv.imshow('face-imageCanvas', src);
  src.delete(); gray.delete(); faceCascade.delete();
  eyeCascade.delete(); faces.delete(); eyes.delete();

  // reenable page
  this.disabled = false;
  document.body.classList.remove('loading');
  document.getElementById('face-downloadButton').classList.add('enabled');
};