window.addEventListener("load", async () => {
  window.table = new SandTable(document.body);
  window.patern = new Patrn();
  window.arm = new Arm(document.body);
  window.player = new Player(table, arm);
  arm.DrawArms();
  table.MoveTo(arm.AngleToPoint().unfloat())

  await patern.Load("patrns/cirlcecirle.patr");
  //var player = new Player(table, arm);
  //player.Play(patern)

  var dragging = false;
  arm.c.addEventListener("mousedown", (e) => {
    arm.PointToAgnle(Victor(e.offsetX, e.offsetY));
    var p = arm.AngleToPoint().unfloat();
    if (!p.isZero()) {
      arm.DrawArms();

      table.LineTo(p);
      patern.points.push(p);
      dragging = true;
    }
  });
  arm.c.addEventListener("mousemove", (e) => {
    if (dragging) {
      arm.PointToAgnle(Victor(e.offsetX, e.offsetY));
      var p = arm.AngleToPoint().unfloat();
      if (!p.isZero()) {
        arm.DrawArms();

        table.LineTo(p);
        patern.points.push(p);
      }
    }
  });
  arm.c.addEventListener("mouseup", () => dragging = false);


  document.querySelector(".Save").addEventListener("click", () => {
    patern.Name = document.querySelector(".Name").value;
    patern.Save(table.c)
  });
})


function openFile(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      patern.Decode(reader.result);
      //player.Play(patern);
    };
    reader.readAsArrayBuffer(input.files[0]);
  };
