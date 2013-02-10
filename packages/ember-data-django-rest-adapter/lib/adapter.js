(function() {
    var get = Ember.get, set = Ember.set;

    DS.DjangoRESTAdapter = DS.RESTAdapter.extend({
        /* cross domain - just in case */
        crossDomain: null,
        bulkCommit: false,
        serializer: DS.DjangoRESTSerializer,

        createRecord: function(store, type, record) {
            var json = {}
            , root = this.rootForType(type)
            , data  = record.serialize()
            , url = this.buildUrlWithParentWhenAvailable(record, this.buildURL(root));

            this.ajax(url, "POST", {
                data: data,
                context: this,
                success: function(pre_json) {
                    json[root] = pre_json;
                    Ember.run(this, function(){
                        this.didCreateRecord(store, type, record, json);
                    });
                },
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });
        },

        updateRecord: function(store, type, record) {
            var json = {}
            , id = get(record, 'id')
            , root = this.rootForType(type)
            , data  = record.serialize();

            this.ajax(this.buildURL(root, id), "PUT", {
                data: data,
                context: this,
                success: function(pre_json) {
                    json[root] = pre_json;
                    Ember.run(this, function(){
                        this.didUpdateRecord(store, type, record, json);
                    });
                },
                error: function(xhr) {
                    this.didError(store, type, record, xhr);
                }
            });
        },

        findMany: function(store, type, ids, parent) {
            var json = {}
            , root = this.rootForType(type)
            , plural = this.pluralize(root)
            , ids = this.serializeIds(ids)
            , url = this.buildFindManyUrlWithParent(store, type, ids, parent);

            this.ajax(url, "GET", {
                success: function(pre_json) {
                    json[plural] = pre_json;
                    Ember.run(this, function(){
                        this.didFindMany(store, type, json);
                    });
                }
            });
        },

        findAll: function(store, type, since) {
            var json = {}
            , root = this.rootForType(type)
            , plural = this.pluralize(root);

            this.ajax(this.buildURL(root), "GET", {
                data: this.sinceQuery(since),
                success: function(pre_json) {
                    json[plural] = pre_json;
                    Ember.run(this, function(){
                        this.didFindAll(store, type, json);
                    });
                }
            });
        },

        find: function(store, type, id) {
            var json = {}
            , root = this.rootForType(type);

            this.ajax(this.buildURL(root, id), "GET", {
                success: function(pre_json) {
                    json[root] = pre_json;
                    Ember.run(this, function(){
                        this.didFindRecord(store, type, json, id);
                    });
                }
            });
        },

        ajax: function(url, type, hash) {
            hash.url = url;
            hash.type = type;
            hash.dataType = 'json';
            hash.context = this;

            jQuery.ajax(hash);
        },

        buildURL: function(record, suffix) {
            var url = this._super(record, suffix);
            if (url.charAt(url.length -1) !== '/') {
                url += '/';
            }
            // Add the server domain if any
            if (!!this.crossDomain) {
                url = this.removeTrailingSlash(this.crossDomain) + url;
            }
            return url;
        },

        buildFindManyUrlWithParent: function(store, type, ids, parent) {
            if (!parent) {
                Ember.assert("You need to add belongsTo for type (" + type + "). No Parent for this record was found");
            }

            var root = this.rootForType(type);
            var url = this.buildURL(root);
            var parentType = store.typeForClientId(parent.get('clientId'));
            var parentRoot = this.rootForType(parentType);
            var record = {'parent_key': parentRoot, 'parent_value': parent.get('id')};

            return this.buildUrlWithParentWhenAvailable(record, url);
        },

        buildUrlWithParentWhenAvailable: function(record, url) {
            var parent_key = record['parent_key'] || record.get('parent_key');
            var parent_value = record['parent_value'] || record.get('parent_value');
            if (parent_key && parent_value) {
                var endpoint = url.split('/').reverse()[1];
                var parent_plural = this.pluralize(parent_key);
                url = url.replace(endpoint, parent_plural + "/" + parent_value + "/" + endpoint);
            }
            return url;
        },
        removeTrailingSlash: function(url) {
            if (url.charAt(url.length -1) === '/') {
                return url.slice(0, -1);
            }
            return url;
        }

    });

})();
