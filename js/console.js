var hapi = new hAPI();

function reallyMakeRequest(aStatus) {
  if (!hapi.authenticated) {
    alert("Authentication error: " + uneval(aStatus));
    return;
  }

  if (document.getElementById("auth"))
    document.body.removeChild(document.getElementById("auth"));

  var method = document.getElementById("method");
  var params = JSON.parse(document.getElementById("params").value);
  hapi.request(method.value, params, function(result, status) {
    document.getElementById("laststatus").textContent = uneval(status);
    document.getElementById("result").value = js_beautify(uneval(result).replace(/(^\(|\)$)/g, ""), {indent_size: 2});
    document.getElementById("progress").setAttribute("style", "display:none");
  });

  fillMethods();
}

function fillMethods() {
  var method = document.getElementById("method");
  if (method.tagName == "SELECT")
    return;

  hapi.request("voxel.hapi.version", {verbosity: "compact"}, function(result, status) {
    var select = document.createElement("select");
    select.id = "method";
    select.onchange = fetchDocs;
    
    var defopt = document.createElement("option");
    defopt.textContent = "Select a method";
    defopt.value = "default";
    select.appendChild(defopt);

    var methods = result.version.methods.method;
    for (var i = 0; i < methods.length; i++) {
      var hm = methods[i].attributes.name;
      var option = document.createElement("option");
      option.value = hm;
      option.textContent = hm;
      select.appendChild(option);
    }

    if (method.value != "")
      select.value = method.value;

    var span = document.getElementById("method-container");
    span.removeChild(method);
    span.appendChild(select);
  });
}

function fetchDocs() {
  // XXX This is nasty, but voxel.hapi.version w/ extended verbosity doesn't
  // offer enough detail to make decent docs
  var method = document.getElementById("method");
  if (method.value == "default")
    return;

  var docs = document.getElementById("docs");
  /*var xhr = new XMLHttpRequest();
  // Since we're doing horrible things here, be sure we're talking to the right server
  xhr.open("GET", "https://api.voxel.net/docs/version/1.0/" + method.value, true);
  xhr.onreadystatechange = function(evt) {
    if (xhr.readyState != 4)
      return;

    var foo = xhr.responseText.match(/[\s\S]*\<\!-- start main-content --\>([\s\S]*)\<\!-- end main content --\>/)[1];
    // Mismatched <div>
    foo = foo.replace('<div id="content">', "", "g");
    docs.innerHTML = foo;
  }
  xhr.send(null);*/
  var secure = (document.location.protocol == "https:");
  var docframe = document.getElementById("docframe");
  if (docframe)
    docframe.src = ((secure) ? "https" : "http") + "://api.voxel.net/docs/version/1.0/" + method.value + "#main-content";
  else {
    var iframe = document.createElement("iframe");
    iframe.id = "docframe";
    iframe.src = ((secure) ? "https" : "http") + "://api.voxel.net/docs/version/1.0/" + method.value + "#main-content";
    iframe.height = "100%";
    iframe.width = "100%";
    iframe.setAttribute("style", "border: none");
    docs.appendChild(iframe);
  }
}

function makeRequest() {
  document.getElementById("progress").setAttribute("style", "display:inline");
  if (!hapi.authenticated)
    this.hapi.authenticate(document.getElementById("name").value,
                           document.getElementById("pass").value,
                           reallyMakeRequest);
  else
    reallyMakeRequest();
}