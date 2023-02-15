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
})

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
//    console.log(document.body.scrollHeight);
//    console.log(document.body.offsetHeight);
//    console.log(html.clientHeight);
//    console.log(html.scrollHeight);
//    console.log(html.offsetHeight);
//    var mHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight, window.innerHeight);
//    var mWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth, window.innerWidth);
//    var mWidth = document.body.scrollWidth;
//    var mHeight = document.body.scrollHeight;
    
    ctx.canvas.width = document.body.scrollWidth;
    ctx.canvas.height = document.body.scrollHeight;
    
//    ctx.canvas.width = 500;
//    ctx.canvas.height = 500;
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var numBoids = 300;				//number of boids objects
    var maxSpeed = 10;				//limiting the speed
    var maxSteeringForce = 0.7;
    var desiredSeparation = 50;		//distance to check for other boids to separate from
    var searchDistance = 200.0;		//distance to search for cohesion and alignment
    var followDis = 200.0;			//distance to follow/repel from -- unimplimented
    var avoidObjectDistance = 150.0;

    //weight of the three flocking influences
    var seperationWeight =1;
    var mouseWeight = 3;
    var alignmentWeight =0.7;
    var cohesionWeight =0.1;

    var radius=10;					//radius of boids
    var flock =[];					//initialize flock


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
        for (var i = 0; i < numBoids;i++){
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

        //for every boid:
        for(var i = 0; i < flock.length; i++){
            ctx.save();
            flock[i].flocking(flock);	//call the flocking updates
            flock[i].updateBoid();		//call the main update
            //draw the boid with it's transformation and rotation
            ctx.translate(flock[i].position.x,flock[i].position.y);
            ctx.rotate(flock[i].velocity.heading());
            circle(radius, flock[i].color);
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

    //when objects go off one side of the screen, come back on the other	
    function screenWrap (vector) {
        if (vector.x < 0){vector.x = width;}
        else if (vector.x > width)	{vector.x = 0;}
        if (vector.y < 0){vector.y = height;}
        else if (vector.y > height){vector.y = 0;}
    }

    //boid object
    var boid = {

        //initialize position and zeroed out velocity and acceleration
        initBoid: function(){
            this.position = Vector(getRndFloat(0.0, width), getRndFloat(0.0, height));
            this.velocity = Vector(0.0,0.0);
            this.acceleration = Vector(0.0,0.0);
            this.color = "rgb(" + getRndInteger(0,255) +"," + getRndInteger(0,255) +","+getRndInteger(0,255)+")";
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
            this.applyForce(this.avoidObject());
            this.applyForce(this.align(boids));
            this.applyForce(this.cohesion(boids));
        },

        //make boids objects aware of each other, move away from other nearby boids
        seperate: function(boids){
            var steer = Vector(0,0);
            var count = 0;
            for(var i = 0; i < boids.length; i++){
                var d = dist(this.position, boids[i].position);
                if (d < desiredSeparation && d > 0)
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
                steer.mult(maxSpeed);
                steer = subtract(steer, this.velocity);
                steer.limit(maxSteeringForce);
            }
            steer.mult(seperationWeight);
            return steer;
        },
        avoidObject: function(){
            var steer = Vector(0,0);
            var x = document.getElementById("mousePosX").innerHTML;
            var y = document.getElementById("mousePosY").innerHTML;
            if (x != null){                
                var avoidObject = Vector(x,y);
                //var avoidObject = Vector (200.0, 200.0);
                var d = dist(this.position, avoidObject);
                if (d < avoidObjectDistance)
                {
                    var delta = Vector();
                    delta = this.position.subtract(avoidObject);
                    delta.normalize();
                    delta.div(d);
                    steer.add(delta);
                    steer.normalize();
                    steer.mult(maxSpeed);
                    steer = subtract(steer, this.velocity);
                    steer.limit(maxSteeringForce);
                }
            }

            steer.mult(mouseWeight);
            return steer;
        },

        //move boids towards the average position of nearby boids, making group stick together
        cohesion: function(boids){
            var sum = Vector(0,0);
            var count = 0;
            for(var i = 0; i < boids.length; i++){
                var d = dist(this.position, boids[i].position);
                if (d < searchDistance && d > 0)
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
                desired.mult(maxSpeed);

                var steer = Vector(0,0);
                steer = subtract(desired, this.velocity);
                steer.limit(maxSteeringForce);
                steer.mult(cohesionWeight);
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
                if (d < searchDistance && d > 0)
                {
                    sum.add(boids[i].velocity);
                    count++;

                }
            }
            if(count >0){

                sum.div(count); 
                sum.normalize();
                sum.mult(maxSpeed);
                var alignment = Vector(0,0);
                alignment= subtract(sum,this.velocity);
                //alignment.normalize();
                //alignment.mult(maxSpeed);
                alignment.limit(maxSteeringForce);
                alignment.mult(alignmentWeight);
                return alignment;
            }
            return Vector(0,0);
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

