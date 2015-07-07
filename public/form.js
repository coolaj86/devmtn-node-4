(function () {
'use strict';

$('body').on('submit', 'form', function (ev) {
  ev.preventDefault();
  ev.stopPropagation();

  $.ajax({
    method: 'POST'
  , url: '/api/login-with-form'
  , data: JSON.stringify({
      username: $('.js-username').val()
    , password: $('.js-password').val()
    })
  , contentType: 'application/json; charset=utf-8'
  }).then(function (resp) {
    window.alert(JSON.stringify(resp));
  });
});
}());
