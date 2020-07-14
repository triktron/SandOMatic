function LinearMove(simulator) {
  this.reachedDesitnation = true;
  this.errorDistance = 5;
  this.DestinationReached = () => {};
  this.AfterStep = () => {};
  this.speed = 1;
  this.loopsPerCall = 50;

  this.Stop = false;
  this.start = Victor();
  this.destrination = Victor();
  this.simulator = simulator;

  this.lastLeftDistance = Infinity;
}


LinearMove.prototype.sqr = function sqr(x) { return x * x }
LinearMove.prototype.dist2 = function dist2(v, w) { return this.sqr(v.x - w.x) + this.sqr(v.y - w.y) }
LinearMove.prototype.distToSegmentSquared = function distToSegmentSquared(p, v, w) {
  var l2 = this.dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  var point = Victor(v.x + t * (w.x - v.x),v.y + t * (w.y - v.y))
  return this.dist2(p, point);
}

LinearMove.prototype.SetDestination = function SetDestination(dest) {
  this.destrination = dest;
  this.destrinationAngle = this.simulator.PointToAgnle.call(this.simulator, dest);
  this.start = this.simulator.AngleToPoint.call(this.simulator);
  this.Stop = false;
  this.lastLeftDistance = Infinity;

  this.step();
}

LinearMove.prototype.step = function Step() {
  if (this.Stop) return;
  var movedDistance = 0;

  for (var z = 0; z < this.loopsPerCall; z++) {

    var current = this.simulator.AngleToPoint();

    this.reachedDesitnation = this.destrination.clone().subtract(current).lengthSq() < this.errorDistance;
    //console.log(this.destrination.clone().subtract(current).lengthSq());
    if (this.reachedDesitnation) return this.DestinationReached();

    if (current.lengthSq() < 10) {
      //if (a > b) {
        this.simulator.ArmAngles.x += Math.sign(this.destrinationAngle.x - this.simulator.ArmAngles.x);
      //} else {
        this.simulator.ArmAngles.y += Math.sign(this.destrinationAngle.y - this.simulator.ArmAngles.y);
      //}
      console.warn("Too close to center!");
    } else {
      var options = [
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x + 1 ,this.simulator.ArmAngles.y)), change: Victor(1,0)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x     ,this.simulator.ArmAngles.y+1)), change: Victor(0,1)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x + 1 ,this.simulator.ArmAngles.y+1)), change: Victor(1,1)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x - 1 ,this.simulator.ArmAngles.y+1)), change: Victor(-1,1)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x + 1 ,this.simulator.ArmAngles.y-1)), change: Victor(1,-1)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x - 1 ,this.simulator.ArmAngles.y)), change: Victor(-1,0)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x     ,this.simulator.ArmAngles.y - 1)), change: Victor(0,-1)},
        {pos: this.simulator.AngleToPoint(Victor(this.simulator.ArmAngles.x - 1 ,this.simulator.ArmAngles.y - 1)), change: Victor(-1,-1)},
      ]

      for (var dot of options) dot.distanceToLine = this.distToSegmentSquared(dot.pos, this.start, this.destrination); // distance to target line
      for (var dot of options) dot.distanceToTarget = this.destrination.clone().subtract(dot.pos).lengthSq(); // distance to target line

      var lastLeftDistance = this.lastLeftDistance;
      options = options.filter(a => {
        return a.distanceToTarget < lastLeftDistance
      });

      // options.sort(function(a, b) {
      //   return a.distanceToTarget - b.distanceToTarget;
      // });


      options.sort(function(a, b) {
        return a.distanceToLine - b.distanceToLine;
      });


      // if (options.length == 1) {
      //   final = options[0];
      // } else
      //   // to far from line
      //   if (options[0].distanceToTarget > options[0].distanceToTarget) {
      //   //if (this.distToSegmentSquared(options[0].pos, this.start, this.destrination).distance > this.distToSegmentSquared(options[1].pos, this.start, this.destrination).distance) {
      //     final = options[1];
      //   } else {
      //     final = options[0];
      //   }

      final = options[0];

      this.lastLeftDistance = final.distanceToTarget;
      this.simulator.ArmAngles.add(final.change);

      movedDistance += current.clone().subtract(final.pos.clone()).length() / this.speed;


    }

        this.AfterStep();
  }

    setTimeout(this.step.bind(this), movedDistance);

}
