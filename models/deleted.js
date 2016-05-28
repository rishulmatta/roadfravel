
var mongoose = require('mongoose');

var deletedPoolSchema = mongoose.Schema({
   "source":  "String",
    "destination":  "String",
      "userid":  "string",
      "creationdate":  "date",
      "planneddate":  "date",
      "category":  "String",
    "vehicle" :"number",
    "recurtype" :  "string",
      "deletiondate" :"date"
      
});



module.exports = mongoose.model('DeletedPool', deletedPoolSchema);