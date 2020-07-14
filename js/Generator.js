var te_interp;

var Module = {};

Module.onRuntimeInitialized = function() {
  te_interp = value => Module.ccall('te_interp',
  'number',
  ['string', 'number'],
  [value, 0])
}

var minDistance = 5;
minDistance = minDistance*minDistance;
function Generator(table, patrn, arm, formula1, formula2, timePerStep, steps) {
  table.Clear();
  patrn.points = [];
  patrn.formula = formula1;
  patrn.formulb = formula2;

  var lastPoint = Victor(te_interp(formula1.replace(/x/g, "0")),te_interp(formula2.replace(/x/g, "0"))).unfloat();
  table.MoveTo(lastPoint);
  for (var i = 1; i < steps; i++) {
    var p = Victor(te_interp(formula1.replace(/x/g, i*timePerStep)),te_interp(formula2.replace(/x/g, i*timePerStep)));
    if (p.lengthSq() > arm.ArmsLength*arm.ArmsLength*4) p.normalize().multiplyScalar(arm.ArmsLength*2);

    var diff = lastPoint.clone().subtract(p).lengthSq();
    //console.log(diff);
    if (diff > minDistance) {
      lastPoint = p.clone();
      p.unfloat().add(Victor(arm.ArmsLength*2,arm.ArmsLength*2));
      patrn.points.push(p);
      table.LineTo(p);
    } else {
      console.log("skipping due to closeness");
    }
  }

  arm.DrawArms();
}
