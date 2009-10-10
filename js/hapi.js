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

function hAPI(aUser, aPass) {
  this.username = aUser;
  this.password = aPass;
}
hAPI.prototype = {
  _apiurl: "https://api.voxel.net/",
  username: "",
  password: "",

  request: function(aMethod, aData, aCallback) {
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
      user: this.username,
      format: "json",
      timestamp: this._generateTimestamp()
    };

    var sig = (flatten(aData, true).concat(flatten(urlParams, true))).sort();
    urlParams.api_sig = hex_md5(this.password + sig.join(""));

    var url = this._apiurl + "?" + flatten(urlParams, false).join("&");
    var postData = flatten(aData, false).join("&");

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

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(postData);
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

hAPI.prototype.cdn = {
  /**
   * @param aDevice Voxel device ID
   * @param aPaths Array of content paths (limit 500)
   */
  populate: function(aDevice, aPaths) {
  },

  /**
   * @param aDevice Voxel device ID
   * @param aPaths Array of content paths (limit 500)
   */
  purge: function(aDevice, aPaths) {
  },

  purgeDirectory: function(aDevice, aPaths) {
  },

  purgeSite: function(aDevice) {
  },

  hosts: function(aDevice, aHostname) {
  },

  stats: function(aDevice, aHostname) {
  },

  transactionStatus: function(aId) {
  }
};

hAPI.prototype.devices = {
  list: function(aVerbosity) {
  },

  /**
   * @param aParams An object of optional {key: value} settings
   */
  createMonitor: function(aDevice, aType, aIP, aParams) {
  },

  deleteMonitor: function(aDevice, aId) {
  },

  disableMonitor: function(aDevice, aId, aMinutes) {
  },

  enableMonitor: function(aDevice, aId) {
  },

  listMonitors: function(aDevice) {
  },

  updateMonitor: function(aDevice, aId, aType, aIP, aParams) {
  },

  powerOn: function(aDevice) {
  },

  powerOff: function(aDevice) {
  },

  powerCycle: function(aDevice) {
  }
};

hAPI.prototype.domains = {
  list: function() {
  },

  getRecords: function(aName, aType) {
  }
};

hAPI.prototype.ondemand = {
  createAccessControl: function(aDevice, aLocation, aHostname, aAllow, aType) {
  },

  deleteAccessControl: function(aDevice, aLocation, aHostname, aType) {
  },

  createLocation: function(aDevice, aPath, aParams) {
  },

  deleteLocation: function(aLocationId) {
  },

  listLocations: function(aDevice) {
  },

  createAlias: function(aDevice, aAlias) {
  },

  deleteAlias: function(aDevice, aAlias) {
  },

  listSites: function(aDevice, aVerbosity) {
  },

  updateSites: function(aDevice, aHostname, aParams) {
  }
};

hAPI.prototype.voxcloud = {
  clone: function(aDevice, aHostname, aParams) {
  },

  destroy: function(aDevice) {
  },

  listIps: function() {
  },

  listOses: function() {
  },

  provision: function(aHostname, aLocation, aOs, aCores, aDiskSize, aParams) {
  },

  status: function(aDevice, aVerbosity) {
  }
};
