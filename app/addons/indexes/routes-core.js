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
  "addons/indexes/resources"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources) {

  var CoreIndexRouteObj =  FauxtonAPI.RouteObject.extend({
    layout: "two_pane",
    apiUrl: function() {
      return [this.doc.url("apiurl"), this.doc.documentation()];
    },
    initialize: function (route, masterLayout, options) {
      this.databaseName = options[0];

      this.setView("#breadcrumbs", new Views.EditorPlaceholder({}));

      this.data = {
        database: new Databases.Model({id:this.databaseName})
      };
      this.docID = options[1]||'new';

      this.doc = new Documents.DDoc({
        _id: this.docID
      }, {
        database: this.data.database
      });

      this.data.designDocs = new Documents.AllDocs(null, {
        database: this.data.database,
        paging: {
          pageSize: 500
        },
        params: {
          startkey: '_design',
          endkey: '_design1',
          include_docs: true,
          limit: 500
        }
      });
    },

    createViewDocumentsView: function (options) {
      return this.setView("#right-content", new Documents.Views.AllDocsList({
        database: options.database,
        collection: options.indexedDocs,
        nestedView: Documents.Views.Row,
        viewList: true,
        ddocInfo: this.ddocInfo(options.designDoc, options.designDocs, options.view),
        docParams: options.docParams,
        params: options.urlParams
      }));
    },


    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
    },

    createParams: function (options) {
      var urlParams = app.getParams(options);
      var params = Documents.QueryParams.parse(urlParams);

      return {
        urlParams: urlParams,
        docParams: _.extend(params, {limit: this.getDocPerPageLimit(params, 20)})
      };
    },

    getDocPerPageLimit: function (urlParams, perPage) {
      var storedPerPage = perPage;

      if (window.localStorage) {
        storedPerPage = window.localStorage.getItem('fauxton:perpage');

        if (!storedPerPage) {
          this.setDocPerPageLimit(perPage);
          storedPerPage = perPage;
        } else {
          storedPerPage = parseInt(storedPerPage, 10);
        }
      }

      if (!urlParams.limit || urlParams.limit > storedPerPage) {
        return parseInt(storedPerPage, 10);
      } else {
        return parseInt(urlParams.limit, 10);
      }
    },

    establish: function () {
      return this.data.designDocs.fetch({reset: true});
    }
  });

  return CoreIndexRouteObj;

});
