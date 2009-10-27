var hapi = new hAPI();

var gVsDevices = {};

function initialize(res, status) {
  // XXX Abstract away HTTP details in hAPI?
  if (status.code != 200)
    alert("failed to initialize: " + status.msg);

  $("#device-tabs").tabs();

  var voxstructure = $("#voxstructure > .devices tbody");
  var voxcast = $("#voxcast > .devices tbody");
  for (var i = 0; i < res.devices.device.length; i++) {
    var device = res.devices.device[i];
    var type = "";
    switch (device.type) {
      case "Cached Site":
        type = "VoxCAST";
        break;
      case "Server":
        type = "VoxSERVER";
        break;
      case "Virtual Server":
        type = device.model;
        break;
    }

    if (type == "VoxCAST") {
      voxcast.append("<tr>" +
        "<td>" + device.attributes.id + "</td>" +
        "<td>" + device.attributes.label + "</td>" +
      "</tr>");
    } else {
      device.prettyType = type;
      gVsDevices[device.attributes.id] = device;
      var monitors = "";
      if (device.monitors) {
        var mon = device.monitors;
        monitors += '<span style="color:';
        if (mon.warn > 0 && mon.down == 0)
          monitors += 'yellow" ';
        else if (mon.down > 0)
          monitors += 'red" ';
        else
          monitors += 'green" ';

        monitors += 'title="Up: ' + mon.up +
                          ((mon.warn > 0) ? ' Warn: ' + mon.warn : '') +
                          ((mon.down > 0) ? ' Down: ' + mon.down : '') +
                          ((mon.warn == 0 && mon.down == 0 && mon.up < mon.total) ? 
                            ' Disabled: ' + (mon.total - mon.up) : '') +
                          '">' + mon.up + '/' + mon.total + '</span>';
      }

      voxstructure.append('<tr data-id="' + device.attributes.id + '">' +
        '<td>' + device.attributes.id + '</td>' +
        '<td>' + type + '</td>' +
        '<td>' + device.attributes.label + '</td>' +
        '<td>' + monitors + '</td>' +
        '<td>' + device.attributes.status + '</td>' +
      '</tr>');
    }
  }

  voxstructure.bind("click", function(e) {
    var elem = e.originalTarget;
    var device = elem.parentNode;
    // XXX yuck.
    while (device.tagName != "TR")
      device = device.parentNode;

    loadVsDevice(device.getAttribute("data-id"));
  });

  $("#container").show('slide');
}

function loadVsDevice(id) {
  var dev = gVsDevices[id];
  var panel = $("#voxstructure-devpanel");

  function setData(first) {
    $(".vspname", panel).text(dev.attributes.label);
    $(".vspid", panel).text(id);
    $(".vsptype", panel).text(dev.prettyType);
    $(".vspos", panel).text(dev.operating_system.name);
    $(".vsparch", panel).text(dev.operating_system.architecture);

    if (!first)
      panel.fadeIn("fast");
  }

  if (panel.is(":visible"))
    panel.fadeOut("fast", setData);
  else {
    setData(true);
    panel.show("blind");
  }
}

$(function() {
  var username = $("#user");
  var password = $("#password");
  var tips = $("#validateTips");
  var login = $("#login");

  function checkLogin(aStatus) {
    if (!hapi.authenticated) {
      tips.animate({backgroundColor: "#aa0000"}, 500).text(aStatus.msg)
          .effect("highlight", {}, 1000);
    } else {
      login.dialog("close");
      hapi.request("voxel.devices.list", initialize);
    }
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
  else
    hapi.request("voxel.devices.list", initialize);
});