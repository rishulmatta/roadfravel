var appConstants = {

    search: "http://localhost:9200/coffeeguru/guru/_search",
	tags:"http://localhost:9200/coffeeguru/tags/_search"
};


function elasticSearch() {

    this.resetFilters();

  
}


elasticSearch.prototype.resetFilters = function() {
    this.reqObj = {
        "query": {

            "filtered": {

                "filter": {

                }
            }
        }
    };
}


elasticSearch.prototype.tagsAutoComplete = function (str,fn) {

    this.reqObj.query.filtered.filter = {
        "prefix": {
            "tag": str
        }
        
    };

    this.fetchFromServer(fn,"tags");
}







// this takes two arguments arry objets of facets , queryString and filters and a callback function
elasticSearch.prototype.fetchResults = function(searchArray, queryString, successFn) {

    this.resetFilters();
    if (typeof searchArray !== 'undefined') {
        this.makeFilterObj(searchArray);
    }
    if (queryString) {
        this.reqObj.query.filtered.query = {


            "query": {
                "query_string": {
                    "fields": ["tags", "name","email", "city"],
                    "query": queryString
                }
            }

        };
    } 

    this.fetchFromServer(successFn);
}



elasticSearch.prototype.makeFilterObj = function(searchArray) {
    //search array is linear , but to apply and across filters and or within a filter we need an object
    var appliedFilters = {};

    for (var ii = 0; ii < searchArray.length; ++ii) {
        var obj = searchArray[ii];

        if (appliedFilters[obj.type] === undefined) {
            appliedFilters[obj.type] = [];
        }
        appliedFilters[obj.type].push(obj.value);

    }

    this.applyOperators(appliedFilters);
}

elasticSearch.prototype.getFilterType = function(prop, appliedFilter) {
    if (prop == 'vehicle' || prop == 'tags') {
        return {
            'term': {
                [prop]: appliedFilter
            }
        };
    } else
    if (prop == 'planneddate') {
        return {
            'range': {
                'planneddate': {
                    "include_lower": true,
                    "include_upper": false,
                    "from": appliedFilter.from,
                    "to": appliedFilter.to
                }
            }
        };
    }
};

elasticSearch.prototype.applyOperators = function(appliedFilters) {

    var obj, length;
    var filter = {};
    filter.and = [];

    for (var prop in appliedFilters) {

        obj = {};
        length = appliedFilters[prop].length;

        if (length > 1) {
            obj.or = [];

            for (var jj = 0; jj < length; ++jj) {
                obj.or.push(
                    this.getFilterType(prop, appliedFilters[prop][jj])
                );
            }
        } else {
            obj = this.getFilterType(prop, appliedFilters[prop][0]);
        }

        filter.and.push(obj);
    }

    this.reqObj.query.filtered.filter = filter;
}


var instance = new elasticSearch();


module.exports = instance
