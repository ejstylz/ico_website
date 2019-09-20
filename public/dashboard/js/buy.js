const usdPrice1 = document.getElementById("usdPrice1");
const usdPrice2 = document.getElementById("usdPrice2");
const usdPrice3 = document.getElementById("usdPrice3");
const cvbAmount1 = document.getElementById("cvbAmount1");
const cvbAmount2 = document.getElementById("cvbAmount2");
const cvbAmount3 = document.getElementById("cvbAmount3");

usdPrice1.onchange = function () {
    cvbAmount1.value = usdPrice1.value / 1;
};

usdPrice2.onchange = function () {
    cvbAmount2.value = usdPrice2.value / 1;
};

usdPrice3.onchange = function () {
    cvbAmount3.value = usdPrice3.value / 1;
};

