var hapi = new hAPI();

function addParam() {
  var ptable = document.getElementById("parameters");
  var param = document.getElementById("template").cloneNode(true);
  param.removeAttribute("id");
  param.removeAttribute("style");
  ptable.appendChild(param);
}

function removeParam(elem) {
  var ptable = document.getElementById("parameters");
  ptable.removeChild(elem.parentNode.parentNode);
}

function login() {
  if (hapi.authenticated)
    hapi.logout();

  var name = document.getElementById("name").value;
  var pass = document.getElementById("pass");
  if (!name && !pass.value) {
    alert("Please enter a username and password");
    return;
  }

  hapi.authenticate(name, pass.value, function(status) {
    pass.value = "";

    if (!hapi.authenticated) {
      alert("An error occurred: " + uneval(status));
      return;
    }

    toggleUI(true);
  });
}

function toggleUI(showConsole) {
  if (showConsole)
    buildMethods();

  document.getElementById("container").setAttribute("hidden", !showConsole);
  document.getElementById("auth").setAttribute("hidden", showConsole);
}

function logout() {
  toggleUI(false);
  hapi.logout();
}

function buildMethods() {
  var select = document.getElementById("method");
  hapi.request("voxel.hapi.version", {verbosity: "compact"}, function(result, status) {
    var methods = result.version.methods.method;
    for (var i = 0; i < methods.length; i++) {
      var name = methods[i].attributes.name;
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }
  });
}

function fetchDocs() {
  var method = document.getElementById("method");
  if (method.value == "default")
    return;

  var docframe = document.getElementById("docframe");
  var protocol = (document.location.protocol == "https:") ? "https:" : "http:";
  docframe.src = protocol + "//api.voxel.net/docs/version/1.0/" + method.value + "#main-content";
}

function submit() {
  var method = document.getElementById("method").value;
  if (method == "default")
    return;

  var ptable = document.getElementById("parameters");
  var params = ptable.getElementsByClassName("param");
  var data = {};
  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    var name = param.getElementsByClassName("pname")[0].value;
    var value = param.getElementsByClassName("pvalue")[0].value;
    if (!name && !value)
      continue;

    data[name] = value;
  }

  hapi.request(method, data, function(result, status) {
    document.getElementById("result").value = js_beautify(uneval(result).replace(/(^\(|\)$)/g, ""), {indent_size: 2});
  });
}
