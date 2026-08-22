import {
  Canvas,
  useFrame,
  useLoader
} from "@react-three/fiber";

import { Stars } from "@react-three/drei";

import {
  TextureLoader,
  AdditiveBlending
} from "three";

import {
  useRef,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import * as THREE from "three";


// =====================================================
// INDIA TARGET
// =====================================================
//
// Approximate geographic center of India:
//
// Latitude  : ~22.5° N
// Longitude : ~79° E
//
// This is ONLY used to orient the 3D globe.
// It does NOT use the user's actual location.
// =====================================================

const INDIA_LATITUDE = 22.5;
const INDIA_LONGITUDE = 79;


// =====================================================
// CONVERT LAT/LON TO 3D POSITION
// =====================================================

function latLonToVector3(
  latitude,
  longitude,
  radius
) {

  const phi =
    (90 - latitude) *
    Math.PI /
    180;

  const theta =
    (longitude + 180) *
    Math.PI /
    180;


  const x =
    -radius *
    Math.sin(phi) *
    Math.cos(theta);

  const y =
    radius *
    Math.cos(phi);

  const z =
    radius *
    Math.sin(phi) *
    Math.sin(theta);


  return new THREE.Vector3(
    x,
    y,
    z
  );
}


// =====================================================
// EARTH
// =====================================================

function WelcomeEarth({ phase }) {

  const earthGroup =
    useRef(null);

  const earthRef =
    useRef(null);

  const cloudsRef =
    useRef(null);

  const lightsRef =
    useRef(null);


  // ===================================================
  // TEXTURES
  // ===================================================

  const [
    earthTexture,
    cloudTexture,
    nightTexture,
    specularTexture
  ] = useLoader(
    TextureLoader,
    [
      "/textures/earth.jpg",
      "/textures/earth_clouds_2048.png",
      "/textures/earth_lights_2048.png",
      "/textures/earth_specular_2048.jpg"
    ]
  );


  // ===================================================
  // INDIA POSITION
  // ===================================================

  const indiaPosition =
    latLonToVector3(
      INDIA_LATITUDE,
      INDIA_LONGITUDE,
      2.15
    );


  // ===================================================
  // TARGET ROTATION
  //
  // We calculate which direction India is located
  // on the globe and rotate the globe so that it
  // faces the camera.
  // ===================================================

  const indiaAngle =
    Math.atan2(
      indiaPosition.x,
      indiaPosition.z
    );


  // ===================================================
  // ANIMATION
  // ===================================================

  useFrame((state, delta) => {

    if (!earthGroup.current) {
      return;
    }


    // =================================================
    // NORMAL ROTATION
    // =================================================

    if (phase === "start") {

      earthGroup.current.rotation.y +=
        delta * 0.055;

    }


    // =================================================
    // ORBIT
    // =================================================

    if (phase === "orbit") {

      earthGroup.current.rotation.y +=
        delta * 0.045;

    }


    // =================================================
    // ROTATE INDIA TOWARD CAMERA
    // =================================================

    if (
      phase === "india" ||
      phase === "final"
    ) {

      const currentRotation =
        earthGroup.current.rotation.y;


      const targetRotation =
        -indiaAngle;


      let difference =
        targetRotation -
        currentRotation;


      // Normalize rotation difference

      difference =
        Math.atan2(
          Math.sin(difference),
          Math.cos(difference)
        );


      earthGroup.current.rotation.y +=
        difference * 0.025;

    }


    // =================================================
    // EARTH
    // =================================================

    if (earthRef.current) {

      earthRef.current.rotation.y +=
        delta * 0.01;

    }


    // =================================================
    // CLOUDS
    // =================================================

    if (cloudsRef.current) {

      cloudsRef.current.rotation.y +=
        delta * 0.015;

    }


    // =================================================
    // CITY LIGHTS
    // =================================================

    if (lightsRef.current) {

      lightsRef.current.rotation.y +=
        delta * 0.01;

    }

  });


  return (

    <group ref={earthGroup}>


      {/* =================================================
          EARTH
      ================================================= */}

      <mesh
        ref={earthRef}
        castShadow
        receiveShadow
      >

        <sphereGeometry
          args={[
            2.15,
            128,
            128
          ]}
        />

        <meshPhongMaterial

          map={earthTexture}

          specularMap={specularTexture}

          specular={
            new THREE.Color(
              "#ffffff"
            )
          }

          shininess={12}

        />

      </mesh>


      {/* =================================================
          CITY LIGHTS
      ================================================= */}

      <mesh
        ref={lightsRef}
        scale={1.006}
      >

        <sphereGeometry
          args={[
            2.15,
            128,
            128
          ]}
        />

        <meshBasicMaterial

          map={nightTexture}

          transparent

          opacity={0.7}

          blending={
            AdditiveBlending
          }

          depthWrite={false}

        />

      </mesh>


      {/* =================================================
          CLOUDS
      ================================================= */}

      <mesh
        ref={cloudsRef}
        scale={1.018}
      >

        <sphereGeometry
          args={[
            2.15,
            128,
            128
          ]}
        />

        <meshPhongMaterial

          map={cloudTexture}

          transparent

          opacity={0.68}

          depthWrite={false}

        />

      </mesh>


      {/* =================================================
          OUTER ATMOSPHERE
      ================================================= */}

      <mesh
        scale={1.075}
      >

        <sphereGeometry
          args={[
            2.15,
            128,
            128
          ]}
        />

        <meshBasicMaterial

          color="#4da6ff"

          transparent

          opacity={0.13}

          blending={
            AdditiveBlending
          }

          side={
            THREE.BackSide
          }

          depthWrite={false}

        />

      </mesh>


      {/* =================================================
          INNER ATMOSPHERE
      ================================================= */}

      <mesh
        scale={1.035}
      >

        <sphereGeometry
          args={[
            2.15,
            128,
            128
          ]}
        />

        <meshBasicMaterial

          color="#76c7ff"

          transparent

          opacity={0.05}

          blending={
            AdditiveBlending
          }

          side={
            THREE.BackSide
          }

          depthWrite={false}

        />

      </mesh>


      {/* =================================================
          INDIA MARKER
      =================================================
      
      This is temporary and helps us verify that
      the camera is actually approaching India.
      
      Once everything works, we can remove it.
      ================================================= */}

      {phase === "final" && (

        <mesh
          position={indiaPosition}
          scale={0.035}
        >

          <sphereGeometry
            args={[
              1,
              16,
              16
            ]}
          />

          <meshBasicMaterial
            color="#ff6b00"
          />

        </mesh>

      )}

    </group>

  );

}


// =====================================================
// SCENE
// =====================================================

function WelcomeScene({ phase }) {

  useFrame((state) => {

    const camera =
      state.camera;


    // =================================================
    // START
    // =================================================

    if (phase === "start") {

      camera.position.lerp(

        new THREE.Vector3(
          0,
          0.6,
          8.5
        ),

        0.025

      );

    }


    // =================================================
    // ORBIT
    // =================================================

    if (phase === "orbit") {

      const time =
        state.clock.elapsedTime;


      const radius = 7;


      camera.position.lerp(

        new THREE.Vector3(

          Math.sin(
            time * 0.20
          ) * radius,

          1.0 +
            Math.sin(
              time * 0.3
            ) * 0.4,

          Math.cos(
            time * 0.20
          ) * radius

        ),

        0.025

      );

    }


    // =================================================
    // INDIA APPROACH
    // =================================================

    if (phase === "india") {

      camera.position.lerp(

        new THREE.Vector3(
          0,
          0.2,
          4.6
        ),

        0.035

      );

    }


    // =================================================
    // FINAL ZOOM
    // =================================================

    if (phase === "final") {

      /*
       * IMPORTANT:
       *
       * Earth radius = 2.15
       *
       * Camera remains outside Earth.
       */

      camera.position.lerp(
  new THREE.Vector3(
    0,
    1.25,
    2.85
  ),
  0.045
);

    }


    // =================================================
    // LOOK AT EARTH
    // =================================================

    camera.lookAt(
      0,
      0,
      0
    );

  });


  return (

    <>


      {/* =================================================
          AMBIENT LIGHT
      ================================================= */}

      <ambientLight
        intensity={0.12}
      />


      {/* =================================================
          SUN
      ================================================= */}

      <directionalLight

        position={[
          -6,
          3,
          6
        ]}

        intensity={3.5}

        castShadow

      />


      {/* =================================================
          SECONDARY LIGHT
      ================================================= */}

      <pointLight

        position={[
          5,
          -2,
          4
        ]}

        intensity={4}

        distance={15}

        color="#ffb36b"

      />


      {/* =================================================
          STARS
      ================================================= */}

      <Stars

        radius={100}

        depth={60}

        count={7000}

        factor={4}

        saturation={0}

        fade

        speed={0.12}

      />


      {/* =================================================
          EARTH
      ================================================= */}

      <WelcomeEarth
        phase={phase}
      />

    </>

  );

}


// =====================================================
// WELCOME PAGE
// =====================================================

export default function Welcome() {

  const navigate =
    useNavigate();


  const [
    phase,
    setPhase
  ] = useState("start");


  const [
    started,
    setStarted
  ] = useState(false);


  // ===================================================
  // START
  // ===================================================

  const startWelcome = () => {

    if (started) {
      return;
    }


    setStarted(true);


    // =================================================
    // PHASE 1
    // =================================================

    setPhase("orbit");


    // =================================================
    // PHASE 2
    // EARTH STARTS TURNING TOWARD INDIA
    // =================================================

    setTimeout(() => {

      setPhase("india");

    }, 1800);


    // =================================================
    // PHASE 3
    // FINAL ZOOM
    // =================================================

    setTimeout(() => {

      setPhase("final");

    }, 4200);


    // =================================================
    // HOME
    // =================================================

    setTimeout(() => {

      navigate("/home");

    }, 6500);

  };


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        overflow-hidden
        bg-black
        text-white
      "
    >


      {/* =================================================
          THREE.JS
      ================================================= */}

      <Canvas

        camera={{
          position: [
            0,
            0.6,
            8.5
          ],

          fov: 45

        }}

        dpr={[
          1,
          1.75
        ]}

        gl={{
          antialias: true,
          alpha: false
        }}

      >

        <WelcomeScene
          phase={phase}
        />

      </Canvas>


      {/* =================================================
          VIGNETTE
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_65%_48%,transparent_10%,rgba(0,0,0,.25)_50%,rgba(0,0,0,.92)_100%)]
        "
      />


      {/* =================================================
          ORBIT LOGO
      ================================================= */}

      <div
        className="
          absolute
          left-8
          top-8
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-orange-500
            shadow-lg
            shadow-orange-500/30
          "
        >

          <span className="text-xl">
            ◎
          </span>

        </div>


        <span
          className="
            text-2xl
            font-bold
            tracking-[0.18em]
          "
        >

          ORBIT

        </span>

      </div>


      {/* =================================================
          WELCOME CONTENT
      ================================================= */}

      <div
        className={`
          absolute
          left-[7%]
          top-1/2
          max-w-md
          -translate-y-1/2
          transition-all
          duration-1000

          ${
            started
              ? "-translate-x-20 opacity-0"
              : "opacity-100"
          }
        `}
      >


        <p
          className="
            mb-4
            text-sm
            font-semibold
            tracking-[0.35em]
            text-orange-400
          "
        >

          WELCOME BACK

        </p>


        <h1
          className="
            text-5xl
            font-black
            leading-[0.95]
            sm:text-7xl
          "
        >

          WELCOME

          <br />

          TO

          <br />

          <span
            className="text-orange-500"
          >

            ORBIT.

          </span>

        </h1>


        <p
          className="
            mt-6
            text-lg
            text-slate-300
          "
        >

          Your Orbit is connecting
          from

        </p>


        <h2
          className="
            mt-1
            text-3xl
            font-bold
            text-white
          "
        >

          🇮🇳 India

        </h2>


        <p
          className="
            mt-3
            max-w-sm
            text-sm
            leading-6
            text-slate-400
          "
        >

          Preparing your space and
          connecting you to the Orbit
          community.

        </p>


        <button

          onClick={startWelcome}

          disabled={started}

          className="
            mt-8
            rounded-xl
            border
            border-orange-500
            bg-orange-500/10
            px-7
            py-3
            font-semibold
            shadow-lg
            shadow-orange-500/10
            transition
            hover:bg-orange-500
            disabled:cursor-wait
          "
        >

          {
            started
              ? "CONNECTING..."
              : "ENTER ORBIT  →"
          }

        </button>

      </div>


      {/* =================================================
          STATUS
      ================================================= */}

      <div
        className="
          absolute
          bottom-7
          left-1/2
          -translate-x-1/2
          text-xs
          tracking-[0.3em]
          text-slate-500
        "
      >

        {phase === "start" &&
          "ORBIT CONNECTION READY"
        }

        {phase === "orbit" &&
          "ESTABLISHING ORBIT"
        }

        {phase === "india" &&
          "ALIGNING WITH INDIA"
        }

        {phase === "final" &&
          "ENTERING YOUR ORBIT"
        }

      </div>


      {/* =================================================
          FINAL FLASH
      ================================================= */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-0
          bg-white
          transition-opacity
          duration-700

          ${
            phase === "final"
              ? "opacity-70"
              : "opacity-0"
          }
        `}
      />

    </div>

  );

}