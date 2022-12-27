# Student/Grades RESTful API
  This project is a RESTful API with endpoints to control data surrounding students and grades. 
  The API will validate a username and password against a user object in the redis database using the basic-auth NodeJS module.
  
  Each user will contain a username, name, hash and salt.
  
  API routes are defined using expressjs. 
  
## Routes
  GET /students
  
  POST /students
  
  DELETE /students/:username
  
  GET /students/:id
  
  PUT /students/:id
  
  GET /grades
  
  POST /grades
  
  GET /grades/:id
  
  PUT /grades/:id
  
  DELETE /grades/:id
  
  DELETE /db
  
  
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
