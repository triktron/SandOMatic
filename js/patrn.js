function Patrn() {
  this.version = 2;
  this.persision = 320;
  this.Name = "";
  this.type = this.Types.Points;
  this.points = [];
  this.Thumbnail = "";
  this.formula = "";
  this.formulb = "";
  this.path = "";
}

Patrn.prototype.Types = {
  Points: 0,
  Angles: 1,
  Radials: 2
}

Patrn.prototype.Load = async function Load(path) {
  let response = await fetch(path);
  let buffer = await response.arrayBuffer();
  this.path = path;

  this.Decode(buffer);
}

Patrn.prototype.Decode = function Decode(buffer) {
  var reader = new ArrayBufferBuilder(buffer);
  this.version = reader.readUint8Clamped();       // version
  this.Name = reader.readString();                // name
  this.type = reader.readUint8Clamped();          // type
  this.persision = reader.readUint16();          // type
  if (this.version > 1) {
    this.formula = reader.readString();
    this.formulb = reader.readString();
  }
  var amoutofpoints = reader.readUint32();   // points amount
  this.points = [];
  for (var i = 0; i < amoutofpoints; i++) {                   // points
    var x = reader.readInt16();
    var y = reader.readInt16();
    this.points.push({x:x,y:y});
  }
  var thumblength = reader.readUint32();  // thumbnail length
  this.Thumbnail = reader.readBuffer(thumblength)                    // thumbnail

  // var arrayBufferView = new Uint8Array( this.Thumbnail );
  //   var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
  //   var urlCreator = window.URL || window.webkitURL;
  //   var imageUrl = urlCreator.createObjectURL( blob );
  //   var img = document.createElement("img");
  //   img.src = imageUrl;
  //   document.body.appendChild(img);
}

Patrn.prototype.Save = async function Save(canvas) {
   var blob = await new Promise(resolve => canvas.toBlob(resolve));
   var buffer = await blob.arrayBuffer();
   this.Thumbnail = buffer;

   var builder = new ArrayBufferBuilder();
   builder.writeUint8Clamped(this.version);       // version
   builder.writeString(this.Name);                // name
   builder.writeUint8Clamped(this.type);          // type
   builder.writeUint16(this.persision);
   builder.writeString(this.formula);                // name
   builder.writeString(this.formulb);                // name
   builder.writeUint32(this.points.length);   // points amount
   for (var p of this.points) {                   // points
     builder.writeInt16(p.x);
     builder.writeInt16(p.y);
   }
   builder.writeUint32(buffer.byteLength);  // thumbnail length
   builder.writeBuffer(buffer)                    // thumbnail
   saveByteArray(builder.buffer, this.Name + ".patr");
}

var saveByteArray = (function () {
    var a = document.createElement("a");
    //document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
        var blob = new Blob([new Uint8Array(data)], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
