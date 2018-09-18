window.onload = function(){
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('serviceWorker.js')
      .then(function(registration) {
        console.info('Registered:', registration);
        /*if ('PushManager' in window) {
          // console.info('Notification is supported!');
        }*/
        }).catch(function(error) {
        console.error('Registration failed: ', error);
      });
  }
}