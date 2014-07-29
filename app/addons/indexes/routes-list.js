// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.
define([
  "app",
  "api",
  "addons/databases/base",
  "addons/indexes/views",
  "addons/documents/views",
  "addons/indexes/resources",
  "addons/indexes/routes-core"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources, RouteCore) {

  var ListIndexes = RouteCore.extend({
    routes: {
      "database/:database/_design/:ddoc/_lists/:fn": {
        route: "tempFn",
        roles: ['_admin']
      },
      "database/:database/new_list": "newListsEditor",
      "database/:database/new_list/:designDoc": "newListsEditor"
    },
    newListsEditor: function(){
      this.setView("#left-content", new Views.EditorPlaceholder({}));

      this.setView("#right-content", new Views.NewIndexPlaceholder({}));
      this.crumbs = function () {
        return [
          {"name": this.data.database.id, "link": Databases.databaseUrl(this.data.database)},
        ];
      };
    },
    tempFn:  function(databaseName, ddoc, fn){
      this.setView("#left-content", new Views.EditorPlaceholder({}));

      this.setView("#right-content", new Views.NewIndexPlaceholder({}));
      this.crumbs = function () {
        return [
          {"name": this.data.database.id, "link": Databases.databaseUrl(this.data.database)},
        ];
      };
    }
  });

  return ListIndexes;
});
