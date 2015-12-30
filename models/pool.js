var mongoose = require('mongoose');

var poolSchema = mongoose.Schema({
	 "source": {
        "type": "[Number]"
      },
	  "destination": {
        "type": "[Number]"
      },
      "userid": {
        "type": "long"
      },
      "creationdate": {
        "type": "date"
      },
      "planneddate": {
        "type": "date"
      },
      "category": {
        "type": "String"
      },
      "gender": {
        "type": "String"
      },
	  "vehicle" :{
		  "type":"integer"
	  }
});



module.exports = mongoose.model('Pool', poolSchema);