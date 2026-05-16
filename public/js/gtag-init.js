window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}
gtag("js", new Date());
if (window.GA_MEASUREMENT_ID) {
  gtag("config", window.GA_MEASUREMENT_ID);
}
