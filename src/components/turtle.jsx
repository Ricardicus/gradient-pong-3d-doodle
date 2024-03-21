import React, { Component } from "react";

import { Suspense, useRef, useLayoutEffect, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stats, OrbitControls } from "@react-three/drei";
import * as three from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

var cylinderMesh = function (pointX, pointY) {
  // edge from X to Y
  var direction = new three.Vector3().subVectors(pointY, pointX);
  var arrow = new three.ArrowHelper(direction, pointX);

  // cylinder: radiusAtTop, radiusAtBottom,
  //     height, radiusSegments, heightSegments
  var edgeGeometry = new three.CylinderGeometry(2, 2, direction.length(), 6, 4);

  var edge = new three.Mesh(
    edgeGeometry,
    new three.MeshBasicMaterial({ color: 0x69797e }),
  );
  edge.rotation = arrow.rotation.clone();
  edge.position = new three.Vector3().addVectors(
    pointX,
    direction.multiplyScalar(0.5),
  );
  return edge;
};

function Cylinder3d({ pointX, pointY, width, color }) {
  // This reference gives us direct access to the three.Mesh object
  var a = new three.Vector3(pointX[0], pointX[1], pointX[2]);
  var b = new three.Vector3(pointY[0], pointY[1], pointY[2]);

  var direction = new three.Vector3().subVectors(b, a);

  const ref = useRef();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    {
    }
  });

  var position = new three.Vector3().addVectors(
    a,
    direction.multiplyScalar(0.5),
  );

  useLayoutEffect(() => {
    if (ref.current) {
      var arrow = new three.ArrowHelper(direction.clone().normalize(), a);
      var rot = new three.Euler().setFromQuaternion(arrow.quaternion);

      ref.current.rotation.copy(rot);
      ref.current.position.x = (b.x + a.x) / 2;
      ref.current.position.y = (b.y + a.y) / 2;
      ref.current.position.z = (b.z + a.z) / 2;
      //ref.current.position = new three.Vector3().addVectors( a, direction.multiplyScalar(0.5));
    }
  }, [pointX, pointY, width, direction]);

  // Return the view, these are regular Threejs elements expressed in JSX
  var m = (
    <mesh
      ref={ref}
      position={position}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <cylinderGeometry args={[width, width, direction.length() * 2, 10]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
  return m;
}

const Cylinders = ({ points }) => {
  var tip = "";
  if (points.length > 0) {
    tip = (
      <Sphere
        position={points[points.length - 1].Y}
        radius={0.05}
        color={"black"}
      />
    );
  }
  return (
    <>
      {points.map(
        (
          point, //<>
        ) => (
          <Cylinder3d
            key={point.key}
            pointX={point.X}
            pointY={point.Y}
            width={point.width}
            color={point.color}
          />
          // <Cube position={[1,0,0]} /></>
        ),
      )}
      {tip}
    </>
  );
};

const Sphere = ({ position, radius, color = "red" }) => {
  const ref = useRef();
  const [hovered, setHover] = useState(false);
  const [clicked, setClick] = useState(false);

  // Update the sphere's scale based on click, and change its color based on hover state
  useFrame(() => {
    if (ref.current) {
      ref.current.scale.set(
        clicked ? 1.5 : 1,
        clicked ? 1.5 : 1,
        clicked ? 1.5 : 1,
      );
    }
  });

  // Convert the position prop to a Three.js Vector3
  const positionVec = new three.Vector3(...position);

  return (
    <mesh
      ref={ref}
      position={positionVec}
      onClick={() => setClick(!clicked)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Cube = ({ position }) => {
  const cube = useRef();

  useFrame(() => {
    //cube.current.rotation.x += 0.01;
    cube.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={cube} position={position}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FFFFFF" />
    </mesh>
  );
};

class Turtle extends Component {
  constructor(props) {
    super(props);

    this.start = true;
    this.ctx = false;
    this.pitch = 0;
    this.yaw = 0;
    this.lstringExe = "";
    this.generatePointsThread = null;
    this.ticks = 0;

    this.penDown = true;
    this.widthFactor = 0.01;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.maxOmega = 0;
    if (this.generatePointsThread != null) {
      clearTimeout(this.generatePointsThread);
    }
    this.maxX = 0;
    this.maxY = 0;
    this.maxZ = 0;

    this.sumUpTo = this.sumUpTo.bind(this);
    this.getCurrentPoint = this.getCurrentPoint.bind(this);
    this.getCurrentPointAt = this.getCurrentPointAt.bind(this);
    this.calcDOmegas = this.calcDOmegas.bind(this);
    this.calcDAlphas = this.calcDAlphas.bind(this);
    this.relaxOmegas = this.relaxOmegas.bind(this);
    this.relaxAlphas = this.relaxAlphas.bind(this);
    this.doUpdate = this.doUpdate.bind(this);
    this.updateOmegas = this.updateOmegas.bind(this);
    this.updateAlphas = this.updateAlphas.bind(this);
    this.loop = this.loop.bind(this);
    this.drawArms = this.drawArms.bind(this);
    this.updateTarget = this.updateTarget.bind(this);

    window.runningSim = true;

    console.log("turtle constructor");
    this.radiuses = [
      [0.5, 0.5, 0.5, 0.3],
      [0.5, 0.5, 0.5, 0.3],
    ];
    this.alphas = [
      [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      [0.5, 0.0, 0.0, 0.0, 0.0, 0.0],
    ];
    this.omegas = [
      [0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
      [0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    ];
    this.target = [Math.random(), Math.random() * 0.5, 0];
    this.dtarget = [0, 0, 1];
    this.startpos = [
      [0, -0.5, -4],
      [0, -0.5, 4],
    ];
    this.moveFactor = [0.000346, 0.000346];
    this.targetStartSpeed = 0.05;
    this.targetSpeed = this.targetStartSpeed;

    this.errorHit = 0.1;
    this.relax = false;

    this.walls = [1.3, 0.5, 5.2];
    this.simulationSpeed = 50;
    this.maxSpeed = 0.1;
    this.hasHit = false;

    this.diffZ = 3;
    this.maxDiff = 0.5;
    this.maxTDiff = 0.7;
    this.speedIncreaseFactor = 1.3;

    this.hits = 0;
    this.maxhits = 0;

    this.state = {
      isFetching: false,
      latest: null,
      points: this.points,
      alphas: null,
      omegas: null,
      domegas: null,
      dalphas: null,
      moveFactor: [props.lr1, props.lr2],
      radiuses: this.radiuses,
      alphas: this.alphas,
      omegas: this.omegas,
      target: this.target,
      dtarget: this.dtarget,
      targetSpeed: this.targetSpeed,
      targetStartSpeed: this.targetStartSpeed,
      points: [[], []],
      errorHit: this.errorHit,
      relax: this.relax,
      walls: this.walls,
      startpos: this.startpos,
      diffZ: this.diffZ,
      colors: props.colors,
      scores: [0, 0],
      updateCB: props.updateCB,
      maxSpeed: this.maxSpeed,
      speedIncreaseFactor: this.speedIncreaseFactor,
      hits: this.hits,
      maxhits: this.maxhits,
      maxDiff: this.maxDiff,
      hasHit: this.hasHit
    };

    this.generatePointsThread = setInterval(this.loop, this.simulationSpeed);
  }

  sumUpTo(arr, i) {
    var s = 0;
    for (var n = 0; n <= i; n++) {
      s += arr[n];
    }
    return s;
  }

  getCurrentPoint(index) {
    var xprev = this.state.startpos[index][0];
    var yprev = this.state.startpos[index][1];
    var zprev = this.state.startpos[index][2];
    for (var i = 0; i < this.state.radiuses[index].length; i++) {
      var r = this.state.radiuses[index][i];
      var alpha = this.sumUpTo(this.state.alphas[index], i);
      var omega = this.sumUpTo(this.state.omegas[index], i);
      var z =
        zprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.cos(alpha * 2 * Math.PI);
      var x =
        xprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.sin(alpha * 2 * Math.PI);
      var y = yprev + r * Math.cos(omega * 2 * Math.PI);
      xprev = x;
      yprev = y;
      zprev = z;
    }
    return [xprev, yprev, zprev];
  }

  getCurrentPointAt(index, iTop) {
    var xprev = this.state.startpos[index][0];
    var yprev = this.state.startpos[index][1];
    var zprev = this.state.startpos[index][2];
    for (var i = 0; i <= iTop; i++) {
      var r = this.state.radiuses[index][i];
      var alpha = this.sumUpTo(this.state.alphas[index], i);
      var omega = this.sumUpTo(this.state.omegas[index], i);

      var z =
        zprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.cos(alpha * 2 * Math.PI);
      var x =
        xprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.sin(alpha * 2 * Math.PI);
      var y = yprev + r * Math.cos(omega * 2 * Math.PI);
      xprev = x;
      yprev = y;
      zprev = z;
    }
    return [xprev, yprev, zprev];
  }

  calcDOmegas(index) {
    var domegas_di = [];
    for (var i = 0; i < this.radiuses[index].length; i++) {
      var r = this.state.radiuses[index][i];
      var tip = this.getCurrentPoint(index);
      var alpha = this.sumUpTo(this.state.alphas[index], i);
      var omega = this.sumUpTo(this.state.omegas[index], i);
      var t2Diff = this.state.target[2] - tip[2];
      var t0Diff = this.state.target[0] - tip[0];
      var t1Diff = this.state.target[1] - tip[1];

      if ( Math.abs(t0Diff) > this.state.maxTDiff ) {
        t0Diff = this.state.maxTDiff * Math.sign(t0Diff);
      }
      if ( Math.abs(t1Diff) > this.state.maxTDiff ) {
        t1Diff = this.state.maxTDiff * Math.sign(t1Diff);
      }
      if ( Math.abs(t2Diff) > this.state.maxTDiff ) {
        t2Diff = this.state.maxTDiff * Math.sign(t2Diff);
      }

      var domegaZ =
        2 *
        Math.PI *
        t2Diff *
        r *
        Math.cos(omega * 2 * Math.PI) *
        Math.cos(alpha * 2 * Math.PI);
      var domegaX =
        2 *
        Math.PI *
        t0Diff *
        r *
        Math.cos(omega * 2 * Math.PI) *
        Math.sin(alpha * 2 * Math.PI);
      var domegaY = 2 * Math.PI * t1Diff * r * -Math.sin(omega * 2 * Math.PI);
      var domega = domegaX + domegaY + domegaZ;
      domegas_di.push(domega);
    }
    var domegas = [];
    for (var i = 0; i < domegas_di.length; i++) {
      domegas.push(0);
    }
    for (var i = domegas_di.length - 1; i >= 0; i--) {
      var s = 0;
      for (var n = i; n < domegas_di.length; n++) {
        s += domegas_di[n];
      }
      if (s > this.state.maxDiff) {
        s = this.state.maxDiff;
      }
      domegas[i] = s;
    }
    //return [0.001, 0, 0, 0, 0, 0];
    return domegas;
  }

  calcDAlphas(index) {
    var dalphas_di = [];
    for (var i = 0; i < this.radiuses[index].length; i++) {
      var r = this.state.radiuses[index][i];
      var tip = this.getCurrentPoint(index);
      var alpha = this.sumUpTo(this.state.alphas[index], i);
      var omega = this.sumUpTo(this.state.omegas[index], i);
      var t2Diff = this.state.target[2] - tip[2];
      var t0Diff = this.state.target[0] - tip[0];
      var t1Diff = this.state.target[1] - tip[1];

      if ( Math.abs(t0Diff) > this.state.maxTDiff ) {
        t0Diff = this.state.maxTDiff * Math.sign(t0Diff);
      }
      if ( Math.abs(t1Diff) > this.state.maxTDiff ) {
        t1Diff = this.state.maxTDiff * Math.sign(t1Diff);
      }
      if ( Math.abs(t2Diff) > this.state.maxTDiff ) {
        t2Diff = this.state.maxTDiff * Math.sign(t2Diff);
      }

      var dalphaZ =
        2 *
        Math.PI *
        t2Diff *
        r *
        Math.sin(omega * 2 * Math.PI) *
        -Math.sin(alpha * 2 * Math.PI);
      var dalphaX =
        2 *
        Math.PI *
        t0Diff *
        r *
        Math.sin(omega * 2 * Math.PI) *
        Math.cos(alpha * 2 * Math.PI);
      var dalphaY = 0;
      var dalpha = dalphaX + dalphaY + dalphaZ;
      dalphas_di.push(dalpha);
    }
    var dalphas = [];
    for (var i = 0; i < dalphas_di.length; i++) {
      dalphas.push(0);
    }
    for (var i = dalphas_di.length - 1; i >= 0; i--) {
      var s = 0;
      for (var n = i; n < dalphas_di.length; n++) {
        s += dalphas_di[n];
      }
      if (s > this.state.maxDiff) {
        s = this.state.maxDiff;
      }
      dalphas[i] = s;
    }
    //return [0, 0, 0, 0, 0, 0];
    return dalphas;
  }

  updateOmegas(index, domegas) {
    var omegas = [];
    for (var i = 0; i < this.state.radiuses[index].length; i++) {
      omegas.push(
        this.state.omegas[index][i] + this.state.moveFactor[index] * domegas[i],
      );
    }
    return omegas;
  }

  updateAlphas(index, dalphas) {
    var alphas = [];
    for (var i = 0; i < this.state.radiuses[index].length; i++) {
      var before = this.state.alphas[index][i];
      var after =
        this.state.alphas[index][i] + this.state.moveFactor[index] * dalphas[i];
      alphas.push(after);
    }
    return alphas;
  }

  relaxOmegas(index) {
    var omegas = [];
    for (var i = 0; i < this.state.radiuses[index].length; i++) {
      var omega =
        this.state.omegas[index][i] +
        (0.05 - this.state.omegas[index][i]) * 0.01;
      omegas.push(omega);
    }
    return omegas;
  }

  relaxAlphas(index) {
    var alphas = [];
    for (var i = 0; i < this.state.radiuses[index].length; i++) {
      var alpha =
        this.state.alphas[index][i] +
        ((index == 1 && i == 0 ? 0.5 : 0) - this.state.alphas[index][i]) * 0.01;
      alphas.push(alpha);
    }
    return alphas;
  }

  doUpdate() {
    var omegas_tot = [];
    var alphas_tot = [];
    this.points = [];
    for (var index = 0; index < this.state.radiuses.length; index++) {
      // check target Z
      var targetZ = this.state.target[2];

      // absolute value of the difference between the target and the current Z
      var diffZ = Math.abs(targetZ - this.state.startpos[index][2]);
      if (diffZ > this.state.diffZ || ( index == 0 && this.state.dtarget[2] > 0 ) || ( index == 1 && this.state.dtarget[2] < 0 ) ) {
        // relax the arm
        var omegas = this.relaxOmegas(index);
        var alphas = this.relaxAlphas(index);

        var armPoints = this.drawArms(
          index,
          this.state.radiuses,
          omegas,
          alphas,
        );
        omegas_tot.push(omegas);
        alphas_tot.push(alphas);
        this.points.push(armPoints);
      } else {
        var domegas = this.calcDOmegas(index);
        var dalphas = this.calcDAlphas(index);

        var omegas = this.updateOmegas(index, domegas);
        var alphas = this.updateAlphas(index, dalphas);

        var armPoints = this.drawArms(
          index,
          this.state.radiuses,
          omegas,
          alphas,
        );
        omegas_tot.push(omegas);
        alphas_tot.push(alphas);
        this.points.push(armPoints);
      }
    }
    var target = this.updateTarget();

    var updates = {
      target: target,
      alphas: alphas_tot,
      omegas: omegas_tot,
      points: this.points,
    };
    this.setState(updates);
    //console.log("omegas", this.state.omegas);
    //console.log("alphas", this.state.alphas);
  }

  loop() {
    if (window.runningSim) {
      this.doUpdate();
    }
  }

  updateTarget() {
    var target = [
      this.state.target[0],
      this.state.target[1],
      this.state.target[2],
    ];
    var score1 = this.state.scores[0];
    var score2 = this.state.scores[1];
    var relax = this.state.relax;
    var newhits = this.state.hits;
    var targetSpeed = this.state.targetSpeed;
    var increaseSpeed = false;
    var hasHit = this.state.hasHit;

    var tip = this.getCurrentPoint(0);
    var error1 = this.Norm([
      this.state.target[0] - tip[0],
      this.state.target[1] - tip[1],
      this.state.target[2] - tip[2],
    ]);
    tip = this.getCurrentPoint(1);
    var error2 = this.Norm([
      this.state.target[0] - tip[0],
      this.state.target[1] - tip[1],
      this.state.target[2] - tip[2],
    ]);

    if ( Math.abs(target[2]) < 1.0 ) {
      hasHit = false;
    }

    for (var i = 0; i < target.length; i++) {
      target[i] = target[i] + this.state.dtarget[i] * this.state.targetSpeed;
    }

    var newdtarget = [
      this.state.dtarget[0],
      this.state.dtarget[1],
      this.state.dtarget[2],
    ];
    for (var i = 0; i < newdtarget.length; i++) {
      if (target[i] > this.state.walls[i] || target[i] < -this.state.walls[i]) {
        newdtarget[i] = -newdtarget[i];
        relax = false;
        if (i == 2) {
          if (target[i] < 0) {
            score1 += 1;
            newhits = 0;
            targetSpeed = this.state.targetStartSpeed;
            increaseSpeed = false;
          } else {
            score2 += 1;
            newhits = 0;
            targetSpeed = this.state.targetStartSpeed;
            increaseSpeed = false;
          }
        }
      }
    }
    if (error1 < this.state.errorHit) {
      if (newdtarget[2] < 0 && !hasHit) {
        newdtarget[2] = -newdtarget[2];
        // a random value between 0 and 1
        var r = Math.random();
        newdtarget[1] = (r - 0.5) * 0.05;
        r = Math.random();
        newdtarget[0] = (r - 0.5) * 0.5;
        increaseSpeed = true;
        newhits += 1;
        hasHit = true;
      }
    } else if (error2 < this.state.errorHit) {
      if (newdtarget[2] > 0 && !hasHit) {
        newdtarget[2] = -newdtarget[2];
        // a random value between 0 and 1
        var r = Math.random();
        newdtarget[1] = (r - 0.5) * 0.5;
        r = Math.random();
        newdtarget[0] = (r - 0.5) * 0.3;
        increaseSpeed = true;
        newhits += 1;
        hasHit = true;
      }
    }
    if (increaseSpeed) {
      targetSpeed = targetSpeed * this.state.speedIncreaseFactor;
    }
    if (targetSpeed > this.state.maxSpeed) {
      targetSpeed = this.state.maxSpeed;
    }

    if (score1 != this.state.scores[0] || score2 != this.state.scores[1]) {
      this.state.updateCB({ score1: score1, score2: score2 });
    }

    if (newhits != this.state.hits) {
      var maxhits = this.state.maxhits;
      if ( newhits > this.state.maxhits ) {
        maxhits = newhits;
      }
      this.state.updateCB({ hits: newhits, maxhits: maxhits });
    }

    this.setState({
      dtarget: newdtarget,
      relax: relax,
      scores: [score1, score2],
      targetSpeed: targetSpeed,
      hits: newhits,
      hasHit: hasHit
    });

    this.target = target;
    return target;
  }

  drawArms(index, radiuses, omegas, alphas) {
    var xprev = this.state.startpos[index][0];
    var yprev = this.state.startpos[index][1];
    var zprev = this.state.startpos[index][2];
    var points = [];
    for (var i = 0; i < radiuses[index].length; i++) {
      var r = radiuses[index][i];
      var alpha = this.sumUpTo(alphas, i);
      var omega = this.sumUpTo(omegas, i);

      var z =
        zprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.cos(alpha * 2 * Math.PI);
      var x =
        xprev +
        r * Math.sin(omega * 2 * Math.PI) * Math.sin(alpha * 2 * Math.PI);
      var y = yprev + r * Math.cos(omega * 2 * Math.PI);
      var point = {
        X: [xprev, yprev, zprev],
        Y: [x, y, z],
        width: this.widthFactor * (radiuses[index].length - i),
        key: "point-" + (i + 1) + "-" + index,
        color: this.state.colors[index],
      };
      xprev = x;
      yprev = y;
      zprev = z;
      points.push(point);
    }
    return points;
  }

  componentDidMount() {
    console.log("turtle mounted");
  }

  shouldComponentUpdate(nextProps) {
    // Check state points and see if they match # mov instructions
    //this.doUpdate();
    if (
      nextProps.lr1 != this.state.moveFactor[0] ||
      nextProps.lr2 != this.state.moveFactor[1]
    ) {
      this.setState({ moveFactor: [nextProps.lr1, nextProps.lr2] });
    }
    for (var i = 0; i < this.points.length; i++) {
      if (this.points.length != this.renderedPoints.length) {
        return true;
      } else {
        if (this.points[i].length != this.renderedPoints[i].length) {
          return true;
        }
        for (var n = 0; n < this.points[i].length; n++) {
          var a = this.points[i][n].X;
          var b = this.renderedPoints[i][n].X;
          if (a[0] != b[0] || a[1] != b[1] || a[2] != b[2]) {
            return true;
          }
        }
      }
    }
    if (this.target[0] != this.renderedTarget[0]) {
      return true;
    }
    if (this.target[1] != this.renderedTarget[1]) {
      return true;
    }
    if (this.target[2] != this.renderedTarget[2]) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props) {
    this.setState({ points: this.points, target: this.target });
  }

  render() {
    this.renderedPoints = [...this.state.points];
    this.renderedTarget = [...this.state.target];
    return (
      <>
        <Cylinders key="points1" points={this.state.points[0]} />
        <Cylinders key="points2" points={this.state.points[1]} />
        <Sphere key="target" position={this.state.target} radius={0.05} />
      </>
    );
  }

  penUp(args) {
    if (args.length == 0) {
      this.penDown = false;
    } else if (args.length == 1) {
      if (parseInt(args[0]) == 0) {
        this.penDown = false;
      }
    } else {
      if (parseInt(args[0]) == parseInt(args[1])) {
        this.penDown = false;
      }
    }
  }

  penDown(args) {
    this.penDown = true;
  }

  push() {
    this.stack.push({
      x: this.x,
      y: this.y,
      z: this.z,
      pitch: this.pitch,
      yaw: this.yaw,
      penDown: this.penDown,
    });
  }

  pop() {
    var st = this.stack.pop();
    this.x = st.x;
    this.y = st.y;
    this.z = st.z;
    this.pitch = st.pitch;
    this.yaw = st.yaw;
    this.penDown = st.penDown;
  }

  contextFunc(args) {
    return this.ticks;
  }

  rotate(args) {
    this.pitch += args[0];
    if (args.length > 1) {
      this.yaw += args[1];
    }
    if (this.maxOmega < this.pitch) {
      this.maxOmega = this.pitch;
    }
  }
  Norm(arr) {
    let Squares = arr.map((val) => val * val);
    let Sum = Squares.reduce((acum, val) => acum + val);

    return Math.sqrt(Sum);
  }
}
export default Turtle;
