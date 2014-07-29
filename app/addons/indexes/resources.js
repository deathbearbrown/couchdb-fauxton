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
  "cloudant.pagingcollection"
],

function(app, FauxtonAPI, PagingCollection) {
 var Resources = {};

  Resources.ViewRow = FauxtonAPI.Model.extend({
    // this is a hack so that backbone.collections doesn't group
    // these by id and reduce the number of items returned.
    idAttribute: "_id",

    docType: function() {
      if (!this.id) return "reduction";

      return this.id.match(/^_design/) ? "design doc" : "doc";
    },
    documentation: function(){
      return "docs";
    },
    url: function(context) {
      return this.collection.database.url(context) + "/" + this.safeID();
    },

    isEditable: function() {
      return this.docType() != "reduction";
    },
    safeID: function() {
      var id = this.id || this.get("id");

      return app.utils.safeURLName(id);
    },

    prettyJSON: function() {
      //var data = this.get("doc") ? this.get("doc") : this;
      return JSON.stringify(this, null, "  ");
    }
  });


  Resources.PouchIndexCollection = PagingCollection.extend({
    model: Resources.ViewRow,
    documentation: function(){
      return "docs";
    },
    initialize: function(_models, options) {
      this.database = options.database;
      this.rows = options.rows;
      this.view = options.view;
      this.design = options.design.replace('_design/','');
      this.params = _.extend({limit: 20, reduce: false}, options.params);

      this.idxType = "_view";
    },

    url: function () {
      return '';
    },

    simple: function () {
      var docs = this.map(function (item) {
        return {
          _id: item.id,
          key: item.get('key'),
          value: item.get('value')
        };
      });

      return new Resources.PouchIndexCollection(docs, {
        database: this.database,
        params: this.params,
        view: this.view,
        design: this.design,
        rows: this.rows
      });

    },

    fetch: function() {
      var deferred = FauxtonAPI.Deferred();
      this.reset(this.rows, {silent: true});

      this.viewMeta = {
        total_rows: this.rows.length,
        offset: 0,
        update_seq: false
      };

      deferred.resolve();
      return deferred;
    },

    totalRows: function() {
      return this.viewMeta.total_rows || "unknown";
    },

    updateSeq: function() {
      return this.viewMeta.update_seq || false;
    },

    buildAllDocs: function(){
      this.fetch();
    },

    allDocs: function(){
      return this.models;
    }
  });

  return Resources;
});
