var User = require('./../models/user');
var DeletedPool = require('./../models/deleted');
var googleConf = require('./../config/google');
var https = require("https");
var request = require('request');
var elasticSearchFilterHandler = require('./../config/elastic-search-filter-handler');

function addUiValueForAggregations (aggregations) {

    for (var name in aggregations) {
        if (name == 'vehicle' ) {
            aggregations[name].uiValue = "Result Type";
            for (var key in aggregations[name].buckets) {
                if (aggregations[name].buckets[key].key == 2) {
                    aggregations[name].buckets[key].uiValue = "Two Wheeler";
                }else
                    if (aggregations[name].buckets[key].key == 4) {
                        aggregations[name].buckets[key].uiValue = "Four Wheeler";
                    } 
                    else
                        if (aggregations[name].buckets[key].key == 0) {
                            aggregations[name].buckets[key].uiValue = "Looking";
                        } 
            }
        }else
            if (name == 'iseven') {
                 aggregations[name].uiValue = "Registration Number";
                for (var key in aggregations[name].buckets) {
                    if (aggregations[name].buckets[key].key == 0) {
                        aggregations[name].buckets[key].uiValue = "Odd";
                    }else
                        if (aggregations[name].buckets[key].key == 1) {
                            aggregations[name].buckets[key].uiValue = "Even";
                        } 
                }
            }
    }

    return aggregations;
}

function fetchUserInfo(req, res, response, next) {
    var userIdsArray, results, length, userId;
    userIdsArray = [];
    results = response ? response.hits.hits : [];

    length = results.length;

    if (length > 0) {

        for (var ii = 0; ii < length; ++ii) {
            userId = results[ii]._source.user_id;
            if (userId && userIdsArray.indexOf(userId) == -1) {
                userIdsArray.push(userId);
            }
        }

        User.find({
            '_id': {
                $in: userIdsArray
            }
        }, function(err, users) {
            var map, obj;
            map = {};
            for (var ii = 0; ii < users.length; ++ii) {
            
                map[users[ii]._id] = users[ii].facebook;
            }

            for (var ii = 0; ii < length; ++ii) {
                userId = results[ii]._source.user_id;
                if (userId && map[userId]) {
                    obj = map[userId];
                    results[ii]._source.name = obj.name;
                    results[ii]._source.email = obj.email;
                    results[ii]._source.gender = obj.gender;
                    results[ii]._source.profileUrl = obj.profileUrl;
                    results[ii]._source.profilePicUrl = obj.profilePicUrl;
                }else {
                    return res.json({results:[],aggregations:[],resultMeta : {total:null}});
                }

            }
             
            return res.json({results:results,aggregations:addUiValueForAggregations(response.aggregations),resultMeta : {total:response.hits.total}});

        });
    } else {
        return res.json({results:[],aggregations:[]});
        next();
    }

}

module.exports = function(app, elasticSearchClient) {
    /* GET home page. */
    app.post('/persist', function(req, res, next) {
        var source, destination;
        var body = req.body;

        destination = {
            latLng: {
                lat: body.destination.latLng.lat,
                lon: body.destination.latLng.lng
            },
            name: body.destination.name,
            id: body.destination.id
        };

        source = {
            latLng: {
                lat: body.source.latLng.lat,
                lon: body.source.latLng.lng
            },
            name:  body.source.name,
            id:  body.source.id
        };



       
        if (req.user) {
            elasticSearchClient.create({
                index: 'roadfravel',
                type: 'pool',
                body: {
                    "source": source,
                    "destination": destination,
                    "creationdate": body.creationdate,
                    "planneddate": body.planneddate,
                    "vehicle": body.vehicle,
                    "user_id": req.user._id,
                    "polyline":body.polyline,
                    "description":body.description,
                    "registrationnumber":body.registrationnumber,
                    "iseven":body.iseven,
                    "cost":body.cost,
                    "recurtype":body.recurtype,
                    "validitydate":body.validitydate
                }
            }, function(error, response) {

                if (error) {
                    return res.json(error);
                }else {
                      return res.json(response);
                }
              
            });
        }

    });



    app.post('/fetch', function(req, res, next) {

        var searchObj,body,queryWithFilter,postQueryFilter,pageNum,pageSize;
        body = req.body;
        postQueryFilter = body.postQueryFilter;
        pageNum = req.query.page;
        pageSize = req.query.pageSize;
        
         elasticSearchFilterHandler.makeFilterObj(body.appliedFilters);

         if (body.filtersReqd) {
            searchObj = {
                    index: 'roadfravel',
                    type: 'pool',
                    from: (pageNum - 1) * pageSize,
                    size: pageSize,    
                    body: {
                        "aggregations": {
                                "vehicle": {
                                    "terms": {
                                        "field": "vehicle"
                                    }
                                },
                                "iseven": {
                                    "terms": {
                                        "field": "iseven"
                                    }
                                }
                            },
                            'query' : elasticSearchFilterHandler.reqObj.query
                    }
                };
        }else {

            if (Object.keys(body.appliedFilters).length === 0) {
                searchObj = {
                        index: 'roadfravel',
                        type: 'pool',
                        from: (pageNum - 1) * pageSize,
                        size: pageSize,   
                        body : {
                            query:{}
                        }
                    };
            }else {
               

                searchObj = {
                        index: 'roadfravel',
                        type: 'pool',
                        from: (pageNum - 1) * pageSize,
                        size: pageSize,   
                        body: elasticSearchFilterHandler.reqObj
                    };
                }
          
        }

        if (typeof postQueryFilter != "undefined") {
            for (var ii in postQueryFilter) {
               if (postQueryFilter[ii].type == 'recurtype')
                 searchObj.body.filter = {
                   "terms" : {
                       "recurtype" : [postQueryFilter[ii].value,"all"]
                   }
                 }; 
            }
          
        }

        elasticSearchClient.search(searchObj, function(error, response) {
            if(!error) {
                 fetchUserInfo(req, res, response, next);
             }else {
                res.json(error);
             }
           
            //return res.json(response);
        });


    });

    app.post('/directions', function(req, res, next) {
        var body, destination, origin, url , propertiesObj;
        body = req.body;
        origin = 'place_id:' + body.source;
        destination = 'place_id:' + body.destination;
        url = googleConf.direction.url + "origin=" + origin + "&" + "destination=" + destination + "&" + "key=" + googleConf.direction.key;
        propertiesObj = {
            origin : origin,
            destination : destination,
            key :  googleConf.direction.key
        };

        request({url:googleConf.direction.url, qs:propertiesObj}, function(err, response, body) {
          if(err) {  return; }
           res.json(response);
        });

       /* request = https.get(url, function(response) {
            // data is streamed in chunks from the server
            // so we have to handle the "data" event    
            var buffer = "",
                data,
                route;

            response.on("data", function(chunk) {
                buffer += chunk;
            });

            response.on("end", function(err) {
                // finished transferring data
                // dump the raw data
                console.log(buffer);
                console.log("\n");
                data = JSON.parse(buffer);
                res.json(data);
            });
        });

        request.end(); */


    });

    app.get('/fetch/mypools', function(req, res, next) {
        var body, pageNum,pageSize,searchObj;
        body = req.body;
        pageNum = req.query.page;
        pageSize = req.query.pageSize;

       
        
        if (req.user._id) {
           
            searchObj = {
                index: 'roadfravel',
                type: 'pool',
                from: (pageNum - 1) * pageSize,
                size: pageSize,   
                body : {"query":{
                            "term":{
                                "user_id":req.user.getValue("_id").toString()
                                }
                            }
                        }
                 };

            console.log(req.user.getValue("_id").toString());
            console.log(JSON.stringify(searchObj));
            elasticSearchClient.search(searchObj, function(error, response) {
                if(!error) {
                       res.json(response);
                 }else {
                    res.json(error);
                 }
               
                //return res.json(response);
            });

        }else {
            return res.json({status:false});
        }

       


    });


     app.delete('/fetch/mypools/:id', function(req, res, next) {
        var body, id,searchObj;
        id = req.params.id;
       
        
        if (req.user._id) {
          

            elasticSearchClient.get({
                index: 'roadfravel',
                type: 'pool',
                id: id
                }, function (error, response) {
                    if(!error) {
                        console.log(response);
                        var metaObj = response._source;
                             var deletedPool = new DeletedPool({ 
                            "source":  metaObj.source.name,
                            "destination":  metaObj.destination.name,
                            "userid":  metaObj.user_id,
                            "creationdate":  metaObj.creationdate,
                            "planneddate":  metaObj.planneddate,
                            "vehicle" :metaObj.vehicle,
                            "recurtype" :  metaObj.recurtype,
                            "deletiondate" : new Date().getTime()
                        });


                        deletedPool.save(function (err,response) {
                            if (err) 
                                return res.json(error);
                            
                            elasticSearchClient.delete({
                                index: 'roadfravel',
                                type: 'pool',
                                id: id
                                }, function(error,response) {
                                    if (error) 
                                       return res.json(error);
                                    else
                                       return res.json({status:true});
                                }
                            );

                        })

                     }else {
                       return res.json(error);
                     }
                    
                
             });
        }

        else {
             res.json({status:false});
        }
    });
};