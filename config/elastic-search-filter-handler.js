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
    if (prop == 'vehicle' || prop == 'iseven') {
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
    }else 
        if (prop =='source') {
            return {
                'geo_distance_range': {
                    'source.latLng': {
                        "lat": appliedFilter.lat,
                        "lon": appliedFilter.lng
                    },
                    'to':appliedFilter.dist || '10km',
                    "optimize_bbox": "memory"
                    }
                }
            }
        else
            if (prop =='destination') {
            return {
                'geo_distance_range': {
                    'destination.latLng': {
                        "lat": appliedFilter.lat,
                        "lon": appliedFilter.lng
                    },
                    'to':appliedFilter.dist || '10km',
                    "optimize_bbox": "memory"
                    }
                }
            }
            else
                if (prop == 'validitydate') {
                return {
                    'range': {
                        'validitydate': {
                           "gte": appliedFilter.presentdate
                        }
                    }
                };
            }
           /* else
                if (prop == 'gtepresentdate') {
                return {
                    'range': {
                        'planneddate': {
                           "gte": appliedFilter.presentdate
                        }
                    }
                };
            }*/
     
};

elasticSearch.prototype.applyOperators = function(appliedFilters) {

    var obj, length;
    var filter = {bool : {
        must : [],
        should :[],
        "minimum_number_should_match" : 0
    }};
    

    for (var prop in appliedFilters) {

        obj = {};
        length = appliedFilters[prop].length;
        if (prop == 'validitydate') {
            
            obj = this.getFilterType(prop, appliedFilters[prop][0]);
           filter.bool.must.push(obj);
            continue;
        }
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

        filter.bool.must.push(obj);
    }

    //if teh planneddate filter is there then there has to be an 'or' with recur pools else we get no results

    for (var index in filter.bool.must) {
        if (filter.bool.must[index]["range"]){
            if (filter.bool.must[index]["range"]['planneddate'])  {
            var newObj = {
                "bool" : {
                    "should" : filter.bool.should
                }
            }

            newObj.bool.should.push({"range":filter.bool.must[index]["range"]});
            filter.bool.must[index] = newObj;
            delete filter.bool.should;
            break;
         }
        }
    }



    this.reqObj.query.filtered.filter = filter;
}


var instance = new elasticSearch();


module.exports = instance
