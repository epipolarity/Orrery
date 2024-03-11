class CelestialBodyModel {

    constructor({ name, distance, radius, angle = 0, color }) {
        this.name = name;
        this.distance = distance;
        this.period = Math.pow(distance, 1.5);
        this.radius = radius;
        this.angle = angle;
        this.color = color;
        this.orbitingBodies = [];
    }

    addOrbitingBody(body) {
        body.parent = this;
        this.orbitingBodies.push(body);
    }

    update(deltaTime, speedFactor) {
        if (this.parent) {
            this.angle += (Math.PI / this.period) * deltaTime * speedFactor;
        }
        this.orbitingBodies.forEach(planet => planet.update(deltaTime, speedFactor));
    }

    spaceNeeded() {
        return this.radius + this.sumOfOrbitingBodiesDiameters();
    }

    sumOfOrbitingBodiesDiameters() {
        let sum = 0;
        for (let i = 0; i < this.orbitingBodies.length; i++) {
            sum += this.orbitingBodies[i].radius * 2;
            if (this.orbitingBodies[i].orbitingBodies.length > 0) {
                sum += this.orbitingBodies[i].sumOfOrbitingBodiesDiameters();
            }
        }
        return sum;
    }

}

class OrreryView {

    constructor(canvas, model) {
        this.canvas = canvas;
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.ctx = canvas.getContext('2d');
        this.speedControl = document.getElementById('speed');
        this.model = model;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.drawBody(this.model, centerX, centerY, Math.min(centerX, centerY));
    }

    getSpeedFactor() {
        return Math.pow(parseInt(this.speedControl.value), 1.75);
    }

    drawBody(body, originX, originY) {

        const bodies = this.getOrbitingBodiesInDistanceOrder(body);
        let distance = body.radius;

        this.ctx.save();
        this.ctx.translate(originX, originY);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, body.radius, 0, Math.PI * 2);    // body
        this.ctx.fillStyle = body.color;
        this.ctx.fill();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            distance += body.spaceNeeded();
            this.ctx.beginPath();
            this.ctx.arc(0, 0, distance, 0, Math.PI * 2);   // orbit
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';    
            this.ctx.stroke();
            this.ctx.save();
            this.ctx.rotate(body.angle);
            this.ctx.translate(distance, 0);
            this.drawBody(body, 0, 0);
            this.ctx.restore();
            distance += body.spaceNeeded();
        }

        this.ctx.restore();
    }


    getOrbitingBodiesInDistanceOrder(body) {
        return body.orbitingBodies.sort((a, b) => a.distance - b.distance);
    }

}


class OrreryController {

    constructor(view, model) {
        this.drawnOnce = false;
        this.view = view;
        this.model = model;
        this.lastTimeStamp = 0;
    }

    update(timeStamp) {
        const speedFactor = this.view.getSpeedFactor();
        if (speedFactor > 0 || !this.drawnOnce) {   // if speedFactor is 0, don't update the model unless it hasn't been drawn yet
            const deltaTime = this.drawnOnce ? (timeStamp - this.lastTimeStamp) / 1000 : 0;     // deltaTime is 0 if it hasn't been drawn yet else it's the time since the last frame
            this.model.update(deltaTime, speedFactor);
            this.view.draw();
            console.log(speedFactor);
            this.drawnOnce = true;
        }
        this.lastTimeStamp = timeStamp;
        requestAnimationFrame(this.update.bind(this));
    }

}

// create the model
const sun = new CelestialBodyModel({ name: 'Sun', distance: 0, radius: 20, color: 'yellow' });

const earth = new CelestialBodyModel({ name: 'Earth', distance: 150, radius: 10, color: 'blue' });
sun.addOrbitingBody(earth);
earth.addOrbitingBody(new CelestialBodyModel({ name: 'Moon', distance: 20, radius: 3, color: 'gray' }));

sun.addOrbitingBody(new CelestialBodyModel({ name: 'Mercury', distance: 50, radius: 5, color: 'gray' }));
sun.addOrbitingBody(new CelestialBodyModel({ name: 'Venus', distance: 100, radius: 8, color: 'orange' }));
sun.addOrbitingBody(new CelestialBodyModel({ name: 'Mars', distance: 200, radius: 7, color: 'red' }));

const jupiter = new CelestialBodyModel({ name: 'Jupiter', distance: 300, radius: 15, color: 'orange' });
jupiter.addOrbitingBody(new CelestialBodyModel({ name: 'Io', distance: 20, radius: 3, color: 'gray' }));
jupiter.addOrbitingBody(new CelestialBodyModel({ name: 'Europa', distance: 30, radius: 3, color: 'gray' }));
jupiter.addOrbitingBody(new CelestialBodyModel({ name: 'Ganymede', distance: 40, radius: 3, color: 'gray' }));
jupiter.addOrbitingBody(new CelestialBodyModel({ name: 'Callisto', distance: 50, radius: 3, color: 'gray' }));

sun.addOrbitingBody(jupiter);

sun.addOrbitingBody(new CelestialBodyModel({ name: 'Saturn', distance: 400, radius: 12, color: 'orange' }));

// create the view
const canvas = document.getElementById('canvas');
const view = new OrreryView(canvas, sun);

// create the controller
const controller = new OrreryController(view, sun);

// start the animation
requestAnimationFrame(controller.update.bind(controller));
