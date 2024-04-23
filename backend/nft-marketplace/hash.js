const Jimp = require('jimp');
const path = './opencv.js';

// 加载 OpenCV.js
function loadOpenCV(path) {
  return new Promise((resolve) => {
    global.Module = {
      onRuntimeInitialized: resolve,
    };
    global.cv = require(path);
  });
}

// 加载并创建一个图像
async function hash(path) {
  //await loadOpenCV(path)
  const newImg = await Jimp.read('./pug.png');
  const pHash = newImg.pHash();
  return pHash;
}

function checkSimilarity(pHash1, pHash2) {
  let distance = 0;
  for (let i = 0; i < pHash1.length; i++) {
    if (pHash1[i] !== pHash2[i]) {
      distance++;
    }
  }
  return (1 - distance / 64) * 100;
}
module.exports = { checkSimilarity };
