const crypto = require('crypto'); 

//some webserver libs
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('basic-auth');

//database connector
const redis = require('redis');
//make redis use promises

//create db client
const client = redis.createClient();
const clientPromise = client.connect()

const port = process.env.NODE_PORT || 3000;

//make sure client connects correctly.
client.on("error", function (err) {
    console.log("Error in redis client.on: " + err);
});

const setUser = function(userObj){
	return client.HSET("user:"+userObj.id, userObj ).then(function(){
		console.log('Successfully created (or overwrote) user '+userObj.id);
	}).catch(function(err){
		console.error("WARNING: errored while attempting to create tester user account");
		console.error(err)
	});

}

clientPromise.then(()=>{
	//make sure the test user credentials exist
	const userObj = {
		salt: new Date().toString(),
		id: 'teacher'
	};
	userObj.hash = crypto.createHash('sha256').update('testing'+userObj.salt).digest('base64');
	//this is a terrible way to do setUser
	//I'm not waiting for the promise to resolve before continuing
	//I'm just hoping it finishes before the first request comes in attempting to authenticate
	setUser(userObj);

})


//start setting up webserver
const app = express();

//decode request body using json
app.use(bodyParser.json());

//allow the API to be loaded from an application running on a different host/port
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
		res.header('Access-Control-Allow-Methods', "PUT, DELETE, POST, GET, HEAD");
        next();
});

//protect our API
app.use(function(req,res,next){
	switch(req.method){
		case "GET":
		case "POST":
		case "PUT":
		case "DELETE":
			//extract the given credentials from the request

			/****Check that creds exist before getting name *****/
			const creds = auth(req);
			let name = creds.name;

			// in here we're checking for HTTP 401
			// basically a validation script for each request to match up the requesting user's header info to a stored user in db
			
			//look up userObj using creds.name
			//TODO use creds.name to lookup the user object in the DB
			//use the userObj.salt and the creds.pass to generate a hash
			//compare the hash, if they match call next() and do not use res object
			//to send anything to client
			//if they dont or DB doesn't have the user or there's any other error use the res object 
			//to return a 401 status code

			client.HGETALL(`user:${creds.name}`)
				.then((userObj)=> {
					if(!userObj){
						return res.sendStatus(401)
					}

					const ha = crypto.createHash('sha256').update(creds.pass + userObj.salt).digest('base64') 
					if(ha !== userObj.hash) return res.sendStatus(401)
					next()
				})
				
			
			break;
		default:
			//maybe an options check or something
			next();
			break;
	}
});

//this takes a set of items and filters, sorts and paginates the items.
//it gets it's commands from queryArgs and returns a new set of items
const filterSortPaginate = (type, queryArgs, items) =>{
	let keys;

	//create an array of filterable/sortable keys
	if(type == 'student'){
		keys = ['id','name'];
	}else{
		keys = ['id','student_id','type','max','grade'];
	}


	//applied to each item in items
	//returning true keeps item
	//TODO: fill out the filterer function
	const filterer = (item) =>{
		//loop through keys defined in above scope
			//if this key exists in queryArgs
			//and it's value doesnt match whats's on the item
			//don't keep the item (return false)
		
		for(let i = 0; i < keys.length; i++){
			const key = keys[i]//.slice(0, queryArgs[key].length);
			if(!queryArgs[key]) continue;
			if(!item[key].toLowerCase().includes(queryArgs[key])) return false
		}
		return true;
		
	};

	//apply above function using Array.filterer
	items = items.filter(filterer);
	console.log('items after filter:',items)

	//always sort, default to sorting on id
	if(!queryArgs._sort){
		queryArgs._sort = 'id';
	}
	//make sure the column can be sorted
	let direction = 1;
	if(!queryArgs._order){
		queryArgs._order = 'asc';
	}
	if(queryArgs._order.toLowerCase() == 'desc'){
		direction = -1;
	}

	//comparator...given 2 items returns which one is greater
	//used to sort items
	//written to use queryArgs._sort as the key when comparing
	//TODO fill out the sorter function
	const sorter = (a,b)=>{
		//Note direction and queryArgs are available to us in the above scope

		//compare a[queryArgs._sort] (case insensitive) to the same in b
		//save a variable with 1 if a is greater than b, -1 if less and 0 if equal
		const toSort = queryArgs._sort;
		if(a[toSort].toLowerCase() === b[toSort].toLowerCase()) return 0
		
		if(a[toSort].toLowerCase() > b[toSort].toLowerCase()) return 1 * direction	

		return -1 * direction;
	};

	//use apply the above comparator using Array.sort
	items.sort(sorter);
	console.log('items after sort:',items)
	//if we need to paginate
	if(queryArgs._start || queryArgs._end || queryArgs._limit){
		//TODO: fill out this if statement
		//define a start and end variable
		//start defaults to 0, end defaults to # of items

		//if queryArgs._start is set, save into start
		//start = queryArgs._start ? queryArgs._start : 0;
		if(queryArgs._start){
			start = queryArgs._start
		}
		//if queryArgs._end is set save it into end
		end = queryArgs._end ? queryArgs._end : items.length
		if(queryArgs._end){
			end = queryArgs._end
		}
		else if(queryArgs._limit){
			end = queryArgs._start + queryArgs._limit
		}

		items = items.slice(start, end);
		//	else if queryArgs._limit is set, save end as start+_limit

		//save over items with items.slice(start,end)

	}
	console.log('items after pagination:',items)
	return items;
};

/**
 * these functions return 200 or 404
 */

// done
app.get('/students/:id',function(req,res){
	
	//Hint use HGETALL
	client.HGETALL(`student:${req.params.id}`)
		.then(student => !student.id ? res.sendStatus(404) : res.json({...student, _ref:`/students/${req.params.id}`}))

});
// done
app.get('/students',function(req,res){
	// smembers to get the keys, hgetall to get the fields
	//TODO fill out the function
	//Hint: use SMEMBERS, then an array of promises from HGETALL and 
	//Promise.all to consolidate responses and filter sort paginate and return them
	

	client.SMEMBERS("students")
		.then((students) => {
			res.setHeader('X-Total-Count', students.length)
			if(students.length < 1){
				return res.json([])
			}
			
			const promises = []
			for(let i = 0; i < students.length; i++){
				const id = students[i]
				promises.push(
					client.HGETALL(`student:${id}`)
					.then((studentObj) => ({...studentObj, _ref:`/students/${studentObj.id}`}))
				)
			}
			Promise.all(promises)
				.then(studentObjs => {
					res.json(filterSortPaginate("student", req.query, studentObjs))
				})

		})

});

// done
app.post('/students',function(req,res){
	//TODO
	//Hint: use sadd and HSET
	if(!req.body || !req.body.id || !req.body.name){
		return res.sendStatus(400)
	}
	
	const student = req.body;
	client.SADD("students", student.id)
		.then((result) => {
			if(result < 1){
				// user alerady exists
				return res.sendStatus(400)
			}

			client.HSET(`student:${student.id}`, student)
				.then((result) => {
					if(result < 1){
						console.log('something went wrong in post /students')
						return res.sendStatus(500)
					}
					res.json({...student, _ref: `/students/${student.id}`})
				})
		})

});

// done
app.delete('/students/:id',function(req,res){
	//TODO
	//Hint use a Promise.all of DEL and SREM
	client.SISMEMBER("students", req.params.id)
		.then(function(exists){
			if(exists){
				client.SREM("students", req.params.id)
					.then(function(){
						client.DEL("student:" + req.params.id)
							.then(function(){
								res.status(200).json({"id": req.params.id})
							}).catch(function(err){
								res.status(400).json({error: err})
							})
					}).catch(function(err){
						res.status(400).json({error: err})
					})
			}
			else {
				res.status(400).send();
			}
		}).catch(function(err){
			console.log(err)
			res.status(400).send();
		})
});

//done
app.put('/students/:id',function(req,res){
	//TODO
	//Hint: use client.HEXISTS and HSET
	client.HEXISTS("students:" + req.params.id, "id")
		.then(function(exists){
			if(exists){
				//check that request as id and name
				client.HSET("student"+req.params.id, "name", req.body.name)
					.then(function(){
						res.status(200).json({"name": req.body.id})
					})
					.catch(function(err){
						console.log(err)
						res.status(400).json({error: err})
					})
			}
			else {
				res.status(400).json({eror: err})
			}
		}).catch(function(err){
			console.log(err)
			res.status(400).json({error: err})
		})

});

// done
app.post('/grades',function(req,res){
	//TODO
	//Hint use INCR and HSET
	if(!req.body || !req.body.grade || !req.body.max || !req.body.type || !req.body.student_id){
		return res.sendStatus(400)
	}
	const {grade, max, type, student_id} = req.body
	const gradeObj = {grade, max, type, student_id}
	client.INCR("grades")
		.then(function(id){
			gradeObj.id="" + id
			client.HSET("grade:" + id, gradeObj)
				.then(function(){
					res.status(200).json({...gradeObj,_ref: `/grades/${gradeObj.id}`})
				}).catch(function(err){
					res.status(400).json({error: err})
				})
		}).catch(function(err){
			res.status(400).json({error: err})
		})

});

// done
app.get('/grades/:id',function(req,res){
	//TODO
	//Hint use HGETALL
	client.HGETALL("grade:" + req.params.id)
		.then(function(value){
			res.status(200).send(value);
		}).catch(function(err){
			res.status(400).send();
		})
});
app.put('/grades/:id',function(req,res){
	//TODO
	//Hint use HEXISTS and HSET
	client.HEXISTS("grade:" + req.params.id, "grade")
		.then(function(exists){
			if(exists){
				client.HGETALL("grade:" + req.params.id)
					.then(function(value){
						for(const key in req.body){
							value[key] = req.body[key];
						}
						client.HSET("grade:" + req.params.id, "student_id", value.student_id, "type", value.type, "max", value.max, "grade", value.grade, "id", value.id)
							.then(function(){
								res.status(200).send() // send more stuff here?
							}).catch(function(err){
								res.status(400).send();
							})
					}).catch(function(err){
						res.status(400).send();
					})
			}
			else {
				res.status(400).send()
			}
		}).catch(function(err){
			res.status(400).send();
		})

});

// done - maybe?
app.delete('/grades/:id',function(req,res){
	//TODO
	//Hint use DEL .....duh
	client.DEL(`grade:${req.params.id}`)
		.then((result) => result < 1 ? res.sendStatus(404) : res.json({_ref:`/grades/${req.params.id}`}))
});

// done
app.get('/grades',function(req,res){
	//TODO
	//Hint use GET, HGETALL
	//and consolidate with Promise.all to filter, sort, paginate
	client.GET("grades")
		.then(function(numGrades){
			const promises = []
			let grades = []
			for(let i = 1; i <= numGrades; i++){
				promises.push(client.HGETALL("grade:"+i)
					.then(function(list){
						if(list != null){
							grades.push(list)
						}
						else {
							console.log("no grade")
						}
					})
				)
			}
			Promise.all(promises)
				.then(function(){
					type = "grade"
					grades = filterSortPaginate(type, req.query, grades)
					res.status(200).set('X-Total-Count', grades.length).json(grades)
				})
		})

});
app.delete('/db',function(req,res){
	client.FLUSHALL().then(function(){
		//make sure the test user credentials exist
		const userObj = {
			salt: new Date().toString(),
			id: 'teacher'
		};
		userObj.hash = crypto.createHash('sha256').update('testing'+userObj.salt).digest('base64');
		//this is a terrible way to do setUser
		//I'm not waiting for the promise to resolve before continuing
		//I'm just hoping it finishes before the first request comes in attempting to authenticate
		setUser(userObj).then(()=>{
			res.sendStatus(200);
		});
	}).catch(function(err){
		res.status(500).json({error: err});
	});
});

clientPromise.then(()=>{
	app.listen(port, function () {
	console.log('Example app listening on port '+port+'!');
	});
})