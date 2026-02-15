if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (window.location.hostname === 'localhost') {
      console.log(
        'Running on localhost, skipping service worker registration.'
      );
      return;
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/' });

    navigator.serviceWorker.oncontrollerchange = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.location.reload();
      }
    };
  });
}
