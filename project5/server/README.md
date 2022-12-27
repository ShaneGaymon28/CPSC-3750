# Student/Grades RESTful API
  This project is a RESTful API with endpoints to control data surrounding students and grades. 
  The API will validate a username and password against a user object in the redis database using the basic-auth NodeJS module.
  
  Each user will contain a username, name, hash and salt.
  
  API routes are defined using expressjs. 
  
  Code is in server.js
  
## Routes
  GET /students - gets all students
  
  POST /students - adds a student
  
  DELETE /students/:username - delete student with matching username
  
  GET /students/:id - get student with id
  
  PUT /students/:id - modify student with id
  
  GET /grades - get all grades
  
  POST /grades - add a grade
  
  GET /grades/:id - get a grade with id
  
  PUT /grades/:id - modify a grade with id
  
  DELETE /grades/:id - delete a grade with id
  
  DELETE /db - delete the entire database
  
  
## The Database (Redis)
  * students - holds set of student IDs
  * student:xyz - holds a hash containing all info about student with id xyz
  * grades - holds number containing the total number of grades created so far
  * grade:11 holds hash containing all info about grade with id 11
  * user:cbaker holds hash containing login credentials associated with username cbaker

## Setup
  
  Install Redis: (https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04)
  
  Edit package.json file to use desired port (in my case port 3002)
  
  Run npm install to install modules needed for NodeJS
  
  Edit nginx config file and add a location block
  ```
  location /project5/ {
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_pass http://127.0.0.1:3002/;
  }
  ```
  
  Restart nginx
  ```
  sudo service nginx restart
  ```
  
 ## Built With
 * Redis
 * NodeJS
 * ExpressJS
