console.log('background.js loaded')

chrome.app.runtime.onLaunched.addListener(function() {
  console.log('background.js chrome.app.runtime.onLaunched')

  chrome.app.window.create('index.html', {
    innerBounds: {
      width: 800,
      height: 600,
      minWidth: 200,
      minHeight: 200,
    }
  });
});
