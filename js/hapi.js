/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the hAPI JS Library.
 *
 * The Initial Developer of the Original Code is
 * Ryan Flint <rflint+hapi-web@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function hAPI() {
  // Check if there's an existing session, authenticate otherwise.
  this.authenticate();
}
hAPI.prototype = {
  authenticated: false,
  _key: "",
  _secret: "",
  _apiurl: "https://api.voxel.net/version/1.0/",
  // XXX Remove this once Voxel ticket #1094986 is fixed
  _apiproxy: "https://screwedbydesign.com/hapi/proxy.php",

  authenticate: function(aUsername, aPassword, aCallback) {
    var tokens = document.cookie.split(";");
    for (var i = 0; i < tokens.length; i++) {
      var cookie = tokens[i].trim().split("=");
      if (cookie[0] == "hapi_key")
        this._key = cookie[1];
      if (cookie[0] == "hapi_secret")
        this._secret = cookie[1];
    }

    if (this._key && this._secret) {
      this.authenticated = true;
    } else if (aUsername && aPassword) {
      var self = this;
      function callback(result, status) {
        if (result.authkey) {
          self._key = result.authkey.key;
          self._secret = result.authkey.secret;
          var secure = (document.location.protocol == "https:") ? ";secure" : "";
          document.cookie = "hapi_key=" + self._key + secure;
          document.cookie = "hapi_secret=" + self._secret + secure;
          self.authenticated = true;
          aCallback(status);
        } else {  
          this.authenticated = false;
          if (aCallback)
            aCallback(status);
        }
      }

      var data = {};
      data.auth = {user: aUsername, pass: aPassword};

      // XXX Remove this once Voxel ticket #1094986 is fixed
      // data.url = this._apiurl + "?method=voxel.hapi.authkeys.read&format=json"
      data.url = this._apiproxy;

      this._makeRequest("GET", data, callback);
    } else {
      this.authenticated = false;
      if (aCallback)
        aCallback({code: 500, msg: "Username and password are required"});
    }
  },

  _makeRequest: function(aHttpMethod, aData, aCallback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(aEvent) {
      if (xhr.readyState == 4) {
        if (!aCallback)
          return;

        if (xhr.status == 200) {
          var res = JSON.parse(xhr.responseText);
          if (res.attributes.stat == "ok") {
            delete res.attributes;
            aCallback(res, {code: 200, msg: "ok"});
          }
          else
            aCallback({}, {code: res.err.attributes.code,
                           msg: res.err.attributes.msg});
        }
        else
          aCallback({}, {code: xhr.status, msg: "server error"});
      }
    };

    xhr.open(aHttpMethod, aData.url, aData.async || true);

    if (aData.auth)
      xhr.setRequestHeader("Authorization", "Basic " +
                           btoa(aData.auth.user + ":" + aData.auth.pass));

    if (aData.postData)
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(aData.postData || null);
  },

  request: function(aMethod, aData, aCallback) {
    if (typeof aData == "function")
      aCallback = aData;

    function flatten(obj, isSig) {
      var arr = [];
      for (var key in obj) {
        if (isSig)
          arr.push(key + "" + obj[key]);
        else
          arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
      }
      return arr;
    }

    var urlParams = {
      method: aMethod,
      key: this._key,
      format: "json",
      timestamp: this._generateTimestamp()
    };

    var sig = (flatten(aData, true).concat(flatten(urlParams, true))).sort();
    urlParams.api_sig = hex_md5(this._secret + sig.join(""));

    var data = {};
    data.url = this._apiurl + "?" + flatten(urlParams, false).join("&");
    data.postData = flatten(aData, false).join("&");

    this._makeRequest("POST", data, aCallback);
  },

  _generateTimestamp: function() {
    function pad(s, l) {
      s = s.toString();
      while (s.length < l)
        s = '0' + s;
      return s;
    }

    var date = new Date();
    return pad(date.getUTCFullYear(), 4) + "-" +
           pad(date.getUTCMonth() + 1, 2) + "-" +
           pad(date.getUTCDate(), 2) + "T" +
           pad(date.getUTCHours(), 2) + ":" +
           pad(date.getUTCMinutes(), 2) + ":" +
           pad(date.getUTCSeconds(), 2) + "Z";
  },

  test: function(aParams) {
  }
};
