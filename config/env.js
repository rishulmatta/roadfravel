module.exports = {
    "development": {
    	"mongodb": {

        "MONGO_URI": "mongodb://localhost/roadfravel",
        "MONGO_OPTIONS": { "db": { "safe": true } }
    	},
    	"facebook":{
    		"CLIENTID":"820895068042721",
    		"CLIENTSECRET" :"b2594fa78457875acb9778c5f541dc49",
    		"CALLBACKURL" :"http://localhost:3000/auth/facebook/callback"
    	},
    	"elasticsearch":{
    		"HOST":"localhost:9200"
    	}
    },
    "production": {

    	"mongodb": {
    		
        "MONGO_URI": process.env.MONGODB_URI,
        "MONGO_OPTIONS": { "db": { "safe": true } }
    	},
    	"facebook":{
    		"CLIENTID":"739055686226660",
    		"CLIENTSECRET" :"7590557bf46ddfdbd470613ff05f961f",
    		"CALLBACKURL" :"http://www.roadfravel.com/auth/facebook/callback"
    	},
    	"elasticsearch":{
    		"HOST":process.env.BONSAI_URL
    	}
    }
}