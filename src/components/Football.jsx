import React, { Component, useMemo } from "react";

import Turtle from "./turtle.jsx";
import ArmInput from "./armInput.jsx";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Stats, OrbitControls, CameraShake } from "@react-three/drei";
import * as three from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { TextureLoader, RepeatWrapping } from "three";

var homepage = "";
//var homepage = "25b06a79ed956e12a19cd8686d08dbae/"

function OBJModel({ url, position, scale = 1, rotation = [0, 0, 0] }) {
  const obj = useLoader(OBJLoader, homepage + url);
  const objRef = useRef();

  // Convert degrees to radians for rotation
  const rotationRadians = rotation.map((degree) => degree * 2.0 * Math.PI);

  useEffect(() => {
    // Ensure obj is a child of the mesh object
    if (objRef.current) {
      objRef.current.clear(); // Clear any existing children to avoid duplicates
      objRef.current.add(obj);
    }
  }, [obj]); // Dependency on 'obj' ensures this effect runs when the obj is loaded or changes

  // Adjust position, rotation, and scale directly on the mesh
  useEffect(() => {
    if (objRef.current) {
      objRef.current.position.set(...position);
      objRef.current.rotation.set(...rotationRadians);
      objRef.current.scale.set(
        Array.isArray(scale) ? scale : [scale, scale, scale],
      );
    }
  }, [position, rotationRadians, scale]); // React to changes in these props

  return (
    <mesh
      position={position}
      rotation={rotationRadians}
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
    >
      {obj && <primitive object={obj} />}
    </mesh>
  );
}

function GrassGround() {
  // Load the grass texture
  const grassTexture = useLoader(TextureLoader, homepage + "epiroc_color.png");
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(20, 20); // Adjust the repeat to control the texture scaling

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry attach="geometry" args={[100, 100]} />
      <meshStandardMaterial attach="material" map={grassTexture} />
    </mesh>
  );
}

// Example component to add a sky
function Sky() {
  const skyTexture = useLoader(TextureLoader, homepage + "epiroc_color.png");
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={skyTexture} side={three.BackSide} />
    </mesh>
  );
}

function TransparentWall(props) {
  const goalTexture = useLoader(TextureLoader, homepage + "football_goal.png");

  return (
    <mesh position={props.position}>
      {" "}
      {/* Adjust position as needed */}
      <planeBufferGeometry attach="geometry" args={[2, 1]} />{" "}
      {/* Adjust size as needed */}
      <meshStandardMaterial
        attach="material"
        map={goalTexture}
        side={three.DoubleSide}
        transparent={true}
        opacity={0.5}
      />
    </mesh>
  );
}

class Football extends Component {
  constructor(props) {
    super(props);
    this.radiuses = [
      [0.5, 0.5, 0.5, 0.3],
      [0.5, 0.5, 0.5, 0.3],
    ];
    this.state = {
      lr1: 0.01,
      lr2: 0.01,
      score1: 0,
      score2: 0,
      hits: 0,
      maxhits: 0,
      error: <div></div>,
      radiuses: this.radiuses,
    };
    this.handleNewInput = this.handleNewInput.bind(this);
  }

  componentDidMount() {
    this.setState({});
  }

  handleNewInput(input) {
    this.setState(input);
  }

  render() {
    return (
      <div>
        <h1>Gradient pong 3D doodle</h1>
        <pre>
          {`The angle arms are trying to reach the red ball and play
ping pong. It does so by attempting to find its correct angle values.
This process is done using gradient optimization.`}
        </pre>
        <div>
          <div>
            <div
              style={{
                border: "1px solid white",
                height: "50vh",
                marginLeft: "5%",
                marginRight: "5%",
              }}
            >
              <Canvas
                concurrent="true"
                camera={{
                  near: 0.1,
                  far: 1000,
                  zoom: 1.5,
                  position: [4, 1, 4],
                }}
                onCreated={({ gl }) => {
                  gl.setClearColor("#000000");
                }}
              >
                <OrbitControls autoRotate={true} autoRotateSpeed={0.1} />
                <Suspense fallback={null}>
                  <Sky />
                  <GrassGround />
                  <OBJModel
                    url="football_goal.obj"
                    position={[1.35, -0.5, -5]}
                    scale={0.005}
                    rotation={[0, 0.5, 0]}
                  />
                  <OBJModel
                    url="football_goal2.obj"
                    position={[-1.35, -0.5, 5]}
                    scale={0.005}
                    rotation={[0, 0, 0]}
                  />
                  <pointLight intensity={4.0} position={[10, 10, -10]} />
                  <pointLight intensity={4.0} position={[10, 10, 10]} />
                  <pointLight intensity={1.0} position={[10, -1, -10]} />
                  <pointLight intensity={0.7} position={[-10, -1, 10]} />
                  <Turtle
                    lr1={this.state.lr1}
                    lr2={this.state.lr2}
                    colors={["yellow", "blue"]}
                    updateCB={this.handleNewInput}
                    radiuses={this.state.radiuses}
                  />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {this.state.error}
        </div>
        <div>
          <h2>
            Score {this.state.score1} - {this.state.score2}
          </h2>
          <h2>
            hits {this.state.hits}, max: {this.state.maxhits}
          </h2>
        </div>
        <div>
          <ArmInput
            lr1={this.props.lr1}
            lr2={this.props.lr2}
            updateCB={this.handleNewInput}
          />
          <br />
          <a
            style={{ color: "white" }}
            href="https://github.com/Ricardicus/gradient-pong-3d-doodle"
          >
            Link to source code
          </a>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

export default Football;
