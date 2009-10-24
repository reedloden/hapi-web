var hapi = new hAPI();

$(function() {
  var username = $("#user");
  var password = $("#password");
  var tips = $("#validateTips");
  var login = $("#login");

  function checkLogin(aStatus) {
    if (!hapi.authenticated)
      tips.animate({backgroundColor: "#aa0000"}, 500).text(aStatus.msg)
          .effect("highlight", {}, 1000);
    else
      login.dialog("close");
  }

  login.dialog({
    autoOpen: false,
    closeOnEscape: false,
    modal: true,
    hide: "drop",
    buttons: {
      'Login': function() {
        hapi.authenticate(username.val(), password.val(), checkLogin);
      }
    },

    beforeclose: function(event, ui) {
      if (!hapi.authenticated) {
        tips.animate({backgroundColor: "#aa0000"}, 500)
            .effect("highlight", {}, 1000);
        return false;
      }
      return true;
    }
  });

  if (!hapi.authenticated)
    login.dialog("open");
});