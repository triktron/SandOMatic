function Simulator(container) {
  // arm initializer
  this.armC = document.createElement("canvas");
  this.armCtx = this.armC.getContext("2d");

  this.armC.width = 500;
  this.armC.height = 500;

  this.ArmAngles = Victor().randomize(Victor(0,this.StepsPerRevolution), Victor(0,this.StepsPerRevolution));


  // sand table
  this.tableC = document.createElement("canvas");
  this.tableCtx = this.tableC.getContext("2d");

  this.tableC.width = 500;
  this.tableC.height = 500;

  this.marblePos = this.AngleToPoint(this.ArmAngles, true).add(Victor(this.tableC.width/2,this.tableC.height/2));

  this.tableCtx.fillStyle = "#f2d2a9";
  this.tableCtx.fillRect(0, 0, this.tableC.width, this.tableC.height);

  container.appendChild(this.tableC);
  container.appendChild(this.armC);

  // player
  this.patrnIndex = 0;
  this.patrn = null;
  this.playing = false;
  this.moveAlgorithme = new LinearMove(this);
}

Simulator.prototype.StepsPerRevolution =  320 * 16;
Simulator.prototype.ArmsLength = 125;

Simulator.prototype.Play = function Play(patrn) {
  this.ClearTable();
  this.patrnIndex = 0;
  this.patrn = patrn;
  this.playing = true;

  this.moveAlgorithme.DestinationReached = this._playframe.bind(this);
  this.moveAlgorithme.AfterStep = this._drawframe.bind(this);

  this.moveAlgorithme.SetDestination(Victor.fromObject(this.patrn.points[this.patrnIndex]).subtract(Victor(this.tableC.width/2,this.tableC.height/2)));
}

Simulator.prototype.Stop = function Stop() {
  this.moveAlgorithme.Stop = true;
  this.playing = false;
}

Simulator.prototype._playframe = function _playframe() {
  this.patrnIndex++;
  if (this.patrn.points.length <= this.patrnIndex) return this.playing = false;

  //console.log("Destination", this.index, "Reached");

  this.moveAlgorithme.SetDestination(Victor.fromObject(this.patrn.points[this.patrnIndex]).subtract(Victor(this.tableC.width/2,this.tableC.height/2)));
}

Simulator.prototype._drawframe = function _drawframe(stepChange) {
  //this.ArmAngles.add(stepChange);
  this.LineTo(this.AngleToPoint(this.ArmAngles, true).add(Victor(this.tableC.width/2,this.tableC.height/2)));
  this.DrawArms();
}


Simulator.prototype.ClearTable = function Clear() {
  this.tableCtx.fillStyle = "#f2d2a9";
  this.tableCtx.fillRect(0, 0, this.tableC.width, this.tableC.height);
}

Simulator.prototype.MoveTo = function MoveTo(newpos) {
  this.marblePos = newpos;
}

Simulator.prototype.LineTo = function MoveTo(newpos) {
  if (newpos.clone().subtract(this.marblePos).isZero()) return;
  var angle = newpos.clone().subtract(this.marblePos).angle() - Math.PI/2;
  //console.log();
  var leverage = .8;

  var start = this.marblePos.clone();
  var stop = newpos.clone();
  this.tableCtx.beginPath();
  this._LineFunction((pos) => this.tableCtx.arc(pos.x, pos.y, 10, angle+leverage, angle+Math.PI-leverage), start, stop);
  this.tableCtx.fillStyle = '#e7c496';
  this.tableCtx.fill();

  start = this.marblePos.clone();

  this.tableCtx.beginPath();
  this.marblePos = this._LineFunction((pos) => this.tableCtx.arc(pos.x, pos.y, 5, 0,  Math.PI*2), start, stop);
  this.tableCtx.fillStyle = '#eccca2';
  this.tableCtx.fill();
}

Simulator.prototype._LineFunction = function _LineFunction(f,start,stop) {
  var dx = Math.abs(stop.x - start.x);
  var dy = Math.abs(stop.y - start.y);
  var sx = (start.x < stop.x) ? 1 : -1;
  var sy = (start.y < stop.y) ? 1 : -1;
  var err = dx - dy;

  while(true) {
    f(start);

    if (Math.abs(start.x - stop.x) < 0.0001 && Math.abs(start.y - stop.y) < 0.0001) return start;
    var e2 = 2*err;
    if (e2 > -dy) { err -= dy; start.x  += sx; }
    if (e2 < dx) { err += dx; start.y  += sy; }
  }
}

Simulator.prototype.DrawArms = function DrawArms() {
  this.armCtx.clearRect(0, 0, this.armC.width, this.armC.height);

  var ArmsAngle1 = this.GetAngle(this.ArmAngles.x);
  var ArmsAngle2 = this.GetAngle(this.ArmAngles.y);

  this.armCtx.beginPath();
  this.armCtx.moveTo(this.armC.width/2, this.armC.height/2);
  this.armCtx.lineTo(Math.cos(ArmsAngle1) * this.ArmsLength + this.armC.width/2, Math.sin(ArmsAngle1) * this.ArmsLength + this.armC.height/2);
  this.armCtx.lineTo(Math.cos(ArmsAngle2) * this.ArmsLength + Math.cos(ArmsAngle1) * this.ArmsLength + this.armC.width/2, Math.sin(ArmsAngle2) * this.ArmsLength + Math.sin(ArmsAngle1) * this.ArmsLength + this.armC.height/2);
  this.armCtx.stroke();

  //this.armCtx.beginPath();
  //this.armCtx.arc(player.linearMove.destrination.x, player.linearMove.destrination.y, 5, 0, 2 * Math.PI);
  //this.armCtx.stroke();
}

Simulator.prototype.PointToAgnle = function PointToAgnle(point, round = true) {
  var angled = point.angleDeg() / 360*this.StepsPerRevolution;

  var d = point.length();

  var angle = Math.acos((d*d)/(2*this.ArmsLength*d)) / (2 * Math.PI) * this.StepsPerRevolution;

  var angleVector = Victor(angled - angle,angled + angle);

  return round ? angleVector.unfloat() : angleVector;
}

Simulator.prototype.AngleToPoint = function AngleToPoint(angle = this.ArmAngles, round) {
  var ArmsAngle1 = this.GetAngle(angle.x);
  var ArmsAngle2 = this.GetAngle(angle.y);
  var x = Math.cos(ArmsAngle2) * this.ArmsLength + Math.cos(ArmsAngle1) * this.ArmsLength;
  var y = Math.sin(ArmsAngle2) * this.ArmsLength + Math.sin(ArmsAngle1) * this.ArmsLength;
  return round ? Victor(x, y).unfloat() : Victor(x, y);
}


Simulator.prototype.GetAngle = function GetAngle(steps) {
  return steps / this.StepsPerRevolution * 2 * Math.PI;
}
