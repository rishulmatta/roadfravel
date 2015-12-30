var User       = require('./../models/user');

function fetchUserInfo(req,res,response,next) {
  var userIdsArray , results, length , userId;
   userIdsArray = [] ;
   results = response.hits.hits;
   length = results.length;

  if (length > 0) {

    for (var ii = 0 ; ii < length ; ++ii) {
      userId = results[ii]._source.user_id;
      if (userId && userIdsArray.indexOf(userId) == -1) {
        userIdsArray.push(userId);
      }
    }

     User.find({'_id':{ $in: userIdsArray } }, function(err, users){ 
      var map , obj;
      map = {};
        for (var ii = 0; ii < users.length ; ++ii) {
          console.log("mongo user profile fetch");
          
          console.log(users[ii]._id);
          console.log(users[ii].facebook);
          console.log(users[ii]);
          map[users[ii]._id] = users[ii].facebook;
        }

         for (var ii = 0 ; ii < length ; ++ii) { 
           userId = results[ii]._source.user_id;
           if (userId) {
            obj = map[userId];
            results[ii]._source.name = obj.name;
            results[ii]._source.email = obj.email;
             results[ii]._source.gender = obj.gender;
              results[ii]._source.profileUrl = obj.profileUrl;              
              results[ii]._source.profilePicUrl = obj.profilePicUrl;
           }          

         }
          return res.json(results);

    });
  }
  else {
    next();
  }
 
}

module.exports = function(app,elasticSearchClient) {
    /* GET home page. */
    app.post('/persist', function(req, res, next) {
        
        var body = req.body;
        var source = {
            lat:body.source.lat,
            lon:body.source.lng
        };

         var destination = {
            lat:body.destination.lat,
            lon:body.destination.lng
        };

    if (req.user) {
          elasticSearchClient.create({
            index: 'roadfravel',
            type: 'pool',
            body: {
                 "source": source,
                  "destination": destination,               
                   "creationdate":body.creationdate,
                   "planneddate": body.planneddate,
                  "vehicle" : body.vehicle,
                  "user_id":req.user._id
            }
          }, function (error, response) {
          
             return res.json(response);
          });
        }

    });

    app.post('/fetch', function(req, res, next) {
        
        var body = req.body;
       
          elasticSearchClient.search({
            index: 'roadfravel',
            type: 'pool'
          }, function (error, response) {
              fetchUserInfo(req,res,response,next);
            //return res.json(response);
          });
        

    });
    
     

};