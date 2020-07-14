function Talk() {
 this.getposinterval = null;
 this.preferdBufferSize = 0;
 this.indexPatern = 0;
}


Talk.__proto__.Commands = {
  getVersion:     ()          => {return new ArrayBufferBuilder().writeUint8Clamped(1).buffer},
  setVersion:     ()          => {return new ArrayBufferBuilder().writeUint8Clamped(2).buffer},
  getCurrentPos:  ()          => {return new ArrayBufferBuilder().writeUint8Clamped(3).buffer},
  setCurrentPos:  (pos)       => {return new ArrayBufferBuilder().writeUint8Clamped(4).writeInt16(pos.x).writeInt16(pos.y).buffer},
  getStatus:      ()          => {return new ArrayBufferBuilder().writeUint8Clamped(5).buffer},
  setStatus: (isMoveing, isCalibrated)      => {return new ArrayBufferBuilder().writeUint8Clamped(6).writeUint8Clamped(isMoveing ? 1 : 0).writeUint8Clamped(isCalibrated ? 1 : 0).buffer},
  getBufferSize:  ()          => {return new ArrayBufferBuilder().writeUint8Clamped(7).buffer},
  setBufferSize:  (size)      => {return new ArrayBufferBuilder().writeUint8Clamped(8).writeUint16(size).buffer},
  askPositions:    ()         => {return new ArrayBufferBuilder().writeUint8Clamped(9).buffer},
  AddPositions:    (positions) => {var b = new ArrayBufferBuilder().writeUint8Clamped(10).writeUint16(positions.length); for (var p of positions) {b.writeInt16(p.x);b.writeInt16(p.y);}; return b.buffer},
  clearBuffer: ()          => {return new ArrayBufferBuilder().writeUint8Clamped(11).buffer}
}

// get version -> cmd 0
// get pos -> cmd 1
// get status -> cmd 2
// respond status -> cmd 3 + is moving
// get buffer size -> cmd 4
// set buffer size -> cmd 5 + buffer size
// ask positions -> cmd 6
// add position -> cmd 7 + position count + positon * count

Talk.prototype.start = function startTalk() {
  this.connection = new WebSocket( 'ws://SandOMatic.local:81' );
  this.connection.binaryType = "arraybuffer";
  this.connection.onopen = this.talkOpen.bind(this);
  this.connection.onmessage = this.parsePacket.bind(this);
  this.connection.onclose = this.stopTalk.bind(this);
  this.connection.onerror = this.stopTalk.bind(this);

  if (this.getposinterval) clearInterval(this.getposinterval);
}

Talk.prototype.stopTalk = function stopTalk() {
  if (this.getposinterval) clearInterval(this.getposinterval);
  if (this.connection) this.connection.close();
}



Talk.prototype.sendPacket = function sendPacket(packet) {
  this.connection.send( packet );
}

Talk.prototype.talkOpen = function talkOpen() {
  this.sendPacket(Talk.Commands.getVersion());
  var self = this;
  this.getposinterval = setInterval(() => self.sendPacket(Talk.Commands.getCurrentPos()), 20);
}

Talk.prototype.parsePacket = function parsePacket(packet) {
    var reader = new ArrayBufferBuilder(packet.data);
    var cmd = reader.readUint8();

    switch (cmd) {
        case 1:
          // esp asking for version, should not happen
            break;
        case 2:
          // esp saying its version number
          if (reader.readUint8() !== 0) console.error("version not matching!");
            break;
        case 3:
        	 // esp asking for pos, should not happen
            break;
        case 4:
            // esp saying current pos
            var pos = Victor(reader.readInt16(),reader.readInt16());
            arm.angles = pos;
            arm.DrawArms();
            table.LineTo(arm.AngleToPoint(pos, true));
            break;
        case 5:
          // esp asking for status
          this.sendPacket(Talk.Commands.responseStatus(player.playing, true));
            break;
        case 6:
          // esp saying status
          console.log("esp is currently" + (reader.readUint8() === 0 ? " not" : "") + " moving");
          console.log("and is" + (reader.readUint8() === 0 ? " not" : "") + " calibrated");
            break;
        case 7:
          // esp asking for buffer size, should not happen
            break;
        case 8:
          // esp sending its buffer size
          preferdBufferSize = reader.readUint16();
            break;
        case 9:
          // esp asking for positions
          console.log("esp asked for more targets");
          var positions = [];
          for (var i = 0; i < 20; i++) {
            console.log(i+indexPatern, Victor.fromObject(patern.points[i+indexPatern]));
            var p = Victor.fromObject(patern.points[i+indexPatern])
            //if (p.lengthSq() > arm.ArmsLength*arm.ArmsLength*4) p.normalize().multiplyScalar(arm.ArmsLength*2);
            positions.push(arm.PointToAgnle(p, true));
          }
          indexPatern += 20;
          this.sendPacket(Talk.Commands.AddPositions(positions));
            break;
        case 10:
          // esp sending positions, should not happen
            break;
    }
}
