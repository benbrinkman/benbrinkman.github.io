/*
This project is dedicated to learning how to use Object Oriented Code in the HTML Canvas using JavaScript
To learn it, I assigned myself the task of creating a flocking (boids) mechanism. For more information on boids, see https://www.red3d.com/cwr/boids/
All code is written by Ben Brinkman
*/

window.addEventListener('mousemove', function(event){
    var ctx = document.getElementById("Draw").getContext('2d');
    document.getElementById("mousePosX").innerHTML = getMousePos(ctx.canvas).x;
    document.getElementById("mousePosY").innerHTML = getMousePos(ctx.canvas).y;
    function  getMousePos(canvas) {
        var rect = canvas.getBoundingClientRect(), // abs. size of element
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

        return {
            x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        }
    }
});
document.addEventListener('keydown', function(event){
    if (event.key === 's') {
        document.getElementById("huddle").innerHTML = "true";
    }
    if (event.key === 'a') {
        document.getElementById("chaos").innerHTML = "true";
    }
    if (event.key === 'c') {
        document.getElementById("scatter").innerHTML = "true";
    }
});

document.addEventListener('keyup', function(event){
    if (event.key === 's') {
        document.getElementById("huddle").innerHTML = "false";
    }
    if (event.key === 'a') {
        document.getElementById("chaos").innerHTML = "false";
    }
    if (event.key === 'c') {
        document.getElementById("scatter").innerHTML = "false";
    }
    if (event.code === 'Space') {
        if(document.getElementById("displayWinds").innerHTML == "true"){
            document.getElementById("displayWinds").innerHTML = "false";
        }else{
            document.getElementById("displayWinds").innerHTML = "true";
        }
    }
});

document.addEventListener("mouseleave", function(event){
    if(event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight))
    {
        document.getElementById("mousePosX").innerHTML = null;
        document.getElementById("mousePosY").innerHTML = null;
    }
});

//on page load begin
window.addEventListener('load', function(){
    "use strict";

    var ctx = document.getElementById("Draw").getContext('2d');
    ctx.canvas.width = document.body.scrollWidth;
    ctx.canvas.height = document.body.scrollHeight;
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var numBoids = 50;				//number of boids objects
    
    var maxSpeed = 15;				//limiting the speed
    var minSpeed = 5;
    
    var maxSteeringForce = 1;
    var minSteeringForce = 0.5;
    
    var minSeparationDistance = 20.0;    //distance to check for other boids to separate from
    var maxSeparationDistance = 50.0;    //distance to check for other boids to separate from
    var minAlignmentDistance = 100.0;		//distance to search for cohesion and alignment
    var maxAlignmentDistance = 175.0;		//distance to search for cohesion and alignment
    var minCohesionDistance = 100.0;			//distance to follow/repel from -- unimplimented
    var maxCohesionDistance = 200.0;			//distance to follow/repel from -- unimplimented
    var minAvoidObjectDistance = 100.0;
    var maxAvoidObjectDistance = 100.0;

    //weight of the three flocking influences
    var seperationWeight =1;
    var mouseWeight = 3;
    var alignmentWeight =0.8;
    var cohesionWeight =0.1;

    var scatter = "false";
    var huddle = "false";
    var chaos = "false";

    
    var radius=10;					//radius of boids
    var flock =[];					//initialize flock

    var numWinds = 6;
    var winds =[];
    
    var drawWinds = true;
//    var wind = Vector(200, 50);
    var windX = 200;
    
    var windWidth = 30;
    var windSpeed = 1;
    var maxWindSpeed = 15;

    function defineCanvasSize(){
        if(window.innerHeight != height || window.innerWidth != width){            
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            width = ctx.canvas.width;
            height = ctx.canvas.height;
        }
    }



    //create a boid object and fill the flock array
    function init(){
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0,0,width, height);
        for (var i = 0; i < numWinds;i++){
            winds[i] = Object.create(wind);
            winds[i].initWind(i+1);
        }
        for (i = 0; i < numBoids;i++){
            flock[i] = Object.create(boid);
            flock[i].initBoid();
            flock[i].updateBoid();
        }
    }

    //update every frame
    function update(){
        ctx.save();	//ctx.save() and ctx.restore() reset the transformations and rotations used to move objects on screen
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        defineCanvasSize();
        ctx.fillRect(0,0,width, height);		//reset background color every frame
        drawWinds = document.getElementById("displayWinds").innerHTML;
        
        scatter = document.getElementById("scatter").innerHTML;
        huddle = document.getElementById("huddle").innerHTML;
        chaos = document.getElementById("chaos").innerHTML;
        
        
        if(drawWinds == "true"){
            for(var i = 0; i < winds.length; i++){
                ctx.strokeStyle = winds[i].color;

                if(winds[i].isVertical){
                    ctx.strokeRect(winds[i].position.x-(windWidth/2),0, windWidth, height);
                }else{
                    ctx.strokeRect(0, winds[i].position.y-(windWidth/2), width, windWidth);
                }

            }
        }
        
        
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";

        //for every boid:
        for(i = 0; i < flock.length; i++){
            ctx.save();
            flock[i].flocking(flock);	//call the flocking updates
            flock[i].updateBoid();		//call the main update
            //draw the boid with it's transformation and rotation
            ctx.translate(flock[i].position.x,flock[i].position.y);
            ctx.rotate(flock[i].velocity.heading());
            circle(radius, flock[i].color);
//            triangle(radius, flock[i].color);
            //ctx.fillRect(0,0,radius+5,radius);
            ctx.restore();
        }
        ctx.restore();
        //                var x = document.getElementById("mousePosX").innerHTML;
        //                var y = document.getElementById("mousePosY").innerHTML;
        //                console.log(x, y);
        //console.log(event.clientX, event.clientY);
    }
    function circle(rad, color){
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    function triangle(rad, color){
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(-2*rad, rad/2);
        ctx.lineTo(-2*rad, -rad/2);
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    //My vector handler
    var vector = {
        //create an object with an x and y variable
        init: function(x, y){
            this.x = x;
            this.y = y;	
        },
        //for adding two functions
        add: function(_vector){
            this.x+=_vector.x;
            this.y+=_vector.y;
            //return this;
        },
        //for subtracting two function -- having issues with this one, using subtract function outside vector instead
        subtract: function(_vector){
            var subbed = Vector(this.x,this.y);
            subbed.x-=_vector.x;
            subbed.y-=_vector.y;
            return subbed;
        },
        //multiplying by either a scalar or a vector
        mult: function(_vector){
            if(typeof _vector === "object"){
                this.x*=_vector.x;
                this.y*=_vector.y;		
                return this;
            }
            this.x*=_vector;
            this.y*=_vector;
            return this;
        },
        //dividing by either a scalar or a vector
        div: function(_vector){
            if(typeof _vector === "object"){
                this.x/=_vector.x;
                this.y/=_vector.y;		
                return this;
            }
            else{
                this.x/=_vector;
                this.y/=_vector;
                return this;
            }
        },
        //normalize the function -- U = V / M, where U is the normalized vector, v is the original vector, and m is the magnitude of the original vector
        normalize: function(){
            var u = Vector(0,0);
            var v = this;
            var m = this.mag();
            if(m!==0)
            {
                u = v.div(m);
            }
            return u;
        },
        //get the magnitude of a vector -- sqrt(x^2+y^2)
        mag: function(){
            return Math.pow((this.x*this.x + this.y*this.y), 0.5);	
        },
        //squared magnitude, used for finding the limit
        magSq: function(){
            return(this.x*this.x + this.y*this.y);
        },
        //lmit the vector to a maximum value. If the absolute value of the magnitude is greater than the max value, it gets normalized to the max value
        limit: function(maxVal){
            if(this.magSq() > maxVal*maxVal){
                this.normalize();
                this.mult(maxVal);
            }
            return this;	
        },
        //find the angle between (0,0) and this vector's (x,y)
        heading: function(){
            var angle = Math.atan2(this.y, this.x);
            return angle;	
        }
    };

    //easy way to create new vector object at an input x and y
    function Vector(x, y){
        var object = Object.create(vector);
        object.init(x,y);
        return object;
    }

    //temp subtract function for vectors -- vector one is not working properly
    var subtract = function(vector1, vector2){
        var subbed = Vector(vector1.x-vector2.x, vector1.y-vector2.y);
        return subbed;
    };


    //distance function -- sqrt( (x1-x2)^2 + (y1-y2)^2 )
    function dist(vec1, vec2){
        var a = vec1.x - vec2.x;
        var b = vec1.y - vec2.y;
        var c = Math.sqrt(a*a+b*b);
        return c;
    }

    /*
	The following two functions were taken from: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
	*/

    //getting random int
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    //getting random float	
    function getRndFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    function getRndBool(chance) {
        if(Math.random() < chance){
            return true;
        }else{
            return false;
        }
    }

    //when objects go off one side of the screen, come back on the other	
    function screenWrap (vector) {
        if (vector.x < 0){vector.x = width-1;}
        else if (vector.x > width)	{vector.x = 1;}
        if (vector.y < 0){vector.y = height-1;}
        else if (vector.y > height){vector.y = 1;}
    }
    
    var wind = {
        initWind: function(type){
            if(type==null || type > 4 || type < 0){
                type = getRndInteger(1,4);
            }
            this.position = Vector(0.0,0.0);
            this.influence = Vector(0.0,0.0);
            if(type == 1){ //going up
                this.position = Vector(getRndFloat(0.0, width), 0.0);
                this.influence = Vector(0.0, windSpeed);
                this.color = "rgba(0, 255, 0, 0.1)";
                this.isVertical = true;
            }
            else if (type == 2){ //going down
                this.position = Vector(getRndFloat(0.0, width), 0.0);
                this.influence = Vector(0.0, -windSpeed);
                this.color = "rgba(255, 0, 0, 0.1)";
                this.isVertical = true;
            }
            else if (type == 3){ //going right
                this.position = Vector(0.0, getRndFloat(0.0, height));
                this.influence = Vector(windSpeed, 0.0);
                this.color = "rgba(0, 255, 0, 0.1)";
                this.isVertical = false;
            }
            else{ //going left
                this.position = Vector(0.0, getRndFloat(0.0, height));
                this.influence = Vector(-windSpeed, 0.0);
                this.color = "rgba(255, 0, 0, 0.1)";
                this.isVertical = false;
            }
            
        },
    };
    
    //boid object
    var boid = {

        //initialize position and zeroed out velocity and acceleration
        initBoid: function(){
            this.position = Vector(getRndFloat(0.0, width), getRndFloat(0.0, height));
            this.velocity = Vector(0.0,0.0);
            this.acceleration = Vector(0.0,0.0);
            this.color = "rgb(" + getRndInteger(0,255) +"," + getRndInteger(0,255) +","+getRndInteger(0,255)+")";
            this.mySpeed = getRndFloat(minSpeed, maxSpeed);
            this.mySteeringForce = getRndFloat(minSteeringForce, maxSteeringForce);
            this.mySeparationDistance = getRndFloat(minSeparationDistance, maxSeparationDistance);
            this.myCohesionDistance = getRndFloat(minCohesionDistance, maxCohesionDistance);
            this.myAlignmentDistance = getRndFloat(minAlignmentDistance, maxAlignmentDistance);
            this.myAvoidObjectDistance = getRndFloat(minAvoidObjectDistance, maxAvoidObjectDistance);
        },
        //update boid
        updateBoid: function(){
            this.velocity.add(this.acceleration);	//add acceleration to velocity
            this.position.add(this.velocity);		//add velocity to position
            this.acceleration.mult(0);				//zero out acceleration
            screenWrap(this.position);				//screenwrap objects
        },

        //applying forces to boids object
        applyForce: function(force){
            this.acceleration.add(force);
        },

        //apply the 3 flocking forces to the boids objects, and adjust them by their weighting
        flocking: function(boids){
            this.applyForce(this.seperate(boids));
            this.applyForce(this.align(boids));
            this.applyForce(this.cohesion(boids));
            this.applyForce(this.avoidObject());
            this.applyForce(this.windForce(winds));
        },

        //make boids objects aware of each other, move away from other nearby boids
        seperate: function(boids){
            var steer = Vector(0,0);
            var count = 0;
            for(var i = 0; i < boids.length; i++){
                var d = dist(this.position, boids[i].position);
                if (d < this.mySeparationDistance && d > 0)
                {
                    var delta = Vector();
                    delta = this.position.subtract(boids[i].position);
                    delta.normalize();
                    delta.div(d);
                    steer.add(delta);
                    count++;

                }
            }

            if(count >0){
                steer.div(count); 
                steer.normalize();
                steer.mult(this.mySpeed);
                steer = subtract(steer, this.velocity);
                steer.limit(this.mySteeringForce);
            }
            steer.mult(seperationWeight);
            if(huddle == "true"){
                steer.mult(-1);
            }
            return steer;
        },
        

        //move boids towards the average position of nearby boids, making group stick together
        cohesion: function(boids){
            var sum = Vector(0,0);
            var count = 0;
            for(var i = 0; i < boids.length; i++){
                var d = dist(this.position, boids[i].position);
                if (d < this.myCohesionDistance && d > 0)
                {
                    sum.add(boids[i].position);
                    count++;
                }
            }
            if(count >0){
                sum.div(count); 

                var desired = Vector(0,0);
                desired = subtract(sum, this.position);
                desired.normalize();
                desired.mult(this.mySpeed);

                var steer = Vector(0,0);
                steer = subtract(desired, this.velocity);
                steer.limit(this.mySteeringForce);
                steer.mult(cohesionWeight);
                if(scatter == "true"){
                    steer.mult(-1);
                }
                return steer;
            }
            return Vector(0,0);
        },
        //steer towards the average velocity of nearby boids, making flocks travel in the same direction
        align: function(boids){
            var sum = Vector(0,0);
            var count = 0;
            for(var i = 0; i < boids.length; i++){
                var d = dist(this.position, boids[i].position);
                if (d < this.myAlignmentDistance && d > 0)
                {
                    sum.add(boids[i].velocity);
                    count++;

                }
            }
            if(count >0){

                sum.div(count); 
                sum.normalize();
                sum.mult(this.mySpeed);
                var alignment = Vector(0,0);
                alignment= subtract(sum,this.velocity);
                //alignment.normalize();
                //alignment.mult(this.mySpeed);
                alignment.limit(this.mySteeringForce);
                alignment.mult(alignmentWeight);
                if(chaos == "true"){
                    alignment.mult(-1);
                }
                return alignment;
            }
            return Vector(0,0);
        },
        avoidObject: function(){
            var steer = Vector(0,0);
            var x = document.getElementById("mousePosX").innerHTML;
            var y = document.getElementById("mousePosY").innerHTML;
            if (x != null){                
                var avoidObject = Vector(x,y);
                //var avoidObject = Vector (200.0, 200.0);
                var d = dist(this.position, avoidObject);
                if (d < this.myAvoidObjectDistance)
                {
                    var delta = Vector();
                    delta = this.position.subtract(avoidObject);
                    delta.normalize();
                    delta.div(d);
                    steer.add(delta);
                    steer.normalize();
                    steer.mult(this.mySpeed);
                    steer = subtract(steer, this.velocity);
                    steer.limit(this.mySteeringForce);
                }
            }

            steer.mult(mouseWeight);
            return steer;
        },
        windForce: function(windObjects){
            var steer = Vector(0,0);
            
            for(var i = 0; i < windObjects.length; i++){
                if(windObjects[i].isVertical){
                    if(this.position.x >= windObjects[i].position.x-(windWidth/2) && this.position.x <=windObjects[i].position.x+(windWidth/2)){
                        steer.add(windObjects[i].influence);
                        steer.normalize();
                        steer.mult(maxWindSpeed);
                        steer = subtract(steer, this.velocity);
                        steer.limit(this.mySteeringForce);
                    }
                }else{
                    if(this.position.y >= windObjects[i].position.y-(windWidth/2) && this.position.y <=windObjects[i].position.y+(windWidth/2)){
                        steer.add(windObjects[i].influence);
                        steer.normalize();
                        steer.mult(maxWindSpeed);
                        steer = subtract(steer, this.velocity);
                        steer.limit(this.mySteeringForce);
                    }
                }
            }            
            return steer;

        },

    };

    //Initialize and update
    init();
    setInterval(update, 30);
});

//for images
/*
function Test(){
	"use strict";
	var ballImg = new Image();
	ballImg.src = 'assets/ball.png';
	ctx.drawImage(ballImg, 0, 0);
}*/

