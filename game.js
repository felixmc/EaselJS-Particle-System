function rand(min, max) {
	return (Math.floor(Math.random() * (max*1000 - min*1000 + 1)) + min*1000)/1000;
}

function randColor(min, max) {
	return new RGBA(
		rand(min.r, max.r),
		rand(min.g, max.g),
		rand(min.b, max.b),
		rand(min.a, max.a)
	);
}

function RGBA(r,g,b,a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
	this.str = function() {
		return "rgba("+Math.round(this.r)+","+Math.round(this.g)+","+Math.round(this.b)+","+Math.round(this.a)+")";
	};
}

function Particle() {
	this.lifetime = 100;
	this.radius = 10;
	this.startColor = new RGBA(255,0,0,255);
	this.endColor = new RGBA(255,0,0,0);
	this.position = { x: 0, y: 0 };
	this.velocity = { x: 0, y: 0 };
	this.shape = null;
	
	this.isDead = function() {
		return this.lifetime < 1 || (this.shape != null && this.shape.scale >= 0);
	};
	
	this.update = function(stage) {
		this.lifetime--;
		
		if (this.shape == null) {
			this.shape = new createjs.Shape();
			this.shape.graphics.beginRadialGradientFill([this.startColor.str(), this.endColor.str()], [0, 1], this.radius*2, this.radius*2, 0, this.radius*2, this.radius*2, this.radius);
			this.shape.graphics.drawCircle(this.radius*2, this.radius*2, this.radius);
			
			createjs.Tween.get(this.shape)
         		.wait(this.lifetime*.7)
         		.to({ alpha: 0.5, useTicks: true }, this.lifetime);

			createjs.Tween.get(this.shape)
         		.wait(this.lifetime*.5)
         		.to({ scaleX: 0, useTicks: true }, this.lifetime);

			createjs.Tween.get(this.shape)
         		.wait(this.lifetime*.5)
         		.to({ scaleY: 0, useTicks: true }, this.lifetime);
			
			stage.addChild(this.shape);
		}
		
		this.shape.x = this.position.x;
		this.shape.y = this.position.y;
		
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	};
	
	this.dispose = function(stage) {
		stage.removeChild(this.shape);
	};
}

function ParticleSystem() {
	this.particles = [];
	this.count = 100;
	this.lifetime = { min: 10, max: 50 };
	
	this.velocityX = { min: 0, max: 0 };
	this.velocityY = { min: 0, max: 0 };
	
	this.positionOffsetX = { min: 0, max: 0 };
	this.positionOffsetY = { min: 0, max: 0 };
	this.position = { x: 0, y: 0 };
	this.radius = { min: 5, max: 10 }
	
	this.startColor = {
		min: new RGBA(200,80,0,255),
		max: new RGBA(255,160,0,255)
	};
	
	this.endColor = {
		min: new RGBA(220,0,0,0),
		max: new RGBA(255,0,0,0)
	};
	
	this.update = function(stage) {
		this.particles.forEach(function(p,i,array) {
			if (p.isDead()) {
				p.dispose(stage);
				array.splice(i,1);
			} else {
				p.update(stage);
			}
		});
		
		if(this.particles.length < this.count) {
			var p = new Particle();
			p.lifetime = rand(this.lifetime.min, this.lifetime.max);
			p.position = { x: this.position.x + rand(this.positionOffsetX.min, this.positionOffsetX.max),
						   y: this.position.y + rand(this.positionOffsetY.min, this.positionOffsetY.max) };
			p.radius = rand(this.radius.min, this.radius.max);
			p.velocity = { x: rand(this.velocityX.min, this.velocityX.max),
						   y: rand(this.velocityY.min, this.velocityY.max) }
			
			p.startColor = randColor(this.startColor.min, this.startColor.max);
			p.endColor = randColor(this.endColor.min, this.endColor.max);
			
			this.particles.push(p);
		}
	};
}

$(document).ready(function() {
	var canvas = document.getElementById('canvas');
	var center = { x: canvas.width / 2, y: canvas.height / 2 };
	var stage = new createjs.Stage(canvas);
	
	var ps = new ParticleSystem();
	ps.lifetime = { min: 350, max: 600 };
	ps.position = { x: center.x, y: 50 };
	ps.positionOffsetX = { min: -3, max: 3 };
	ps.positionOffsetY = { min: -3, max: 3 };
	ps.velocityY = { min: -2, max: 2 };
	ps.velocityX = { min: -2, max: 2 };
	ps.radius = { min: 7, max: 12 };
	ps.count = 500;
	ps.startColor = {
		min: new RGBA(230,50,0,255),
		max: new RGBA(255,230,0,255)
	};
	
	ps.endColor = {
		min: new RGBA(255,0,0,0),
		max: new RGBA(255,0,0,0)
	};
	
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", function() {
		
		ps.position = { x: stage.mouseX, y: stage.mouseY };
		
		ps.update(stage);
		stage.update();
	});

});