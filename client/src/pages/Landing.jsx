import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import {
    TextureLoader,
    AdditiveBlending
} from "three";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";


// =====================================================
// REALISTIC EARTH
// =====================================================

function RealisticEarth() {

    const earthRef = useRef(null);
    const cloudsRef = useRef(null);
    const lightsRef = useRef(null);


    // =================================================
    // LOAD AVAILABLE TEXTURES
    // =================================================

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


    // =================================================
    // EARTH ROTATION
    // =================================================

    useFrame((_, delta) => {

        // ---------------------------------------------
        // EARTH
        // ---------------------------------------------

        if (earthRef.current) {

            earthRef.current.rotation.y +=
                delta * 0.08;

        }


        // ---------------------------------------------
        // CLOUDS
        // ---------------------------------------------

        if (cloudsRef.current) {

            cloudsRef.current.rotation.y +=
                delta * 0.095;

        }


        // ---------------------------------------------
        // NIGHT LIGHTS
        // ---------------------------------------------

        if (lightsRef.current) {

            lightsRef.current.rotation.y +=
                delta * 0.08;

        }

    });


    return (

        <group>


            {/* =================================================
                EARTH SURFACE
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
                NIGHT LIGHTS
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

                    opacity={0.75}

                    blending={
                        AdditiveBlending
                    }

                    depthWrite={false}

                />

            </mesh>



            {/* =================================================
                CLOUD LAYER
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

                    opacity={0.70}

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

                    opacity={0.055}

                    blending={
                        AdditiveBlending
                    }

                    side={
                        THREE.BackSide
                    }

                    depthWrite={false}

                />

            </mesh>

        </group>

    );

}



// =====================================================
// EARTH SCENE
// =====================================================

function Scene({ phase }) {

    useFrame((state) => {

        const camera =
            state.camera;


        // =================================================
        // INITIAL POSITION
        // =================================================

        if (phase === "start") {

            camera.position.lerp(

                new THREE.Vector3(
                    0,
                    0.5,
                    8.5
                ),

                0.025

            );

        }


        // =================================================
        // ORBIT AROUND EARTH
        // =================================================

        if (phase === "orbit") {

            const time =
                state.clock.elapsedTime;


            const radius = 7;


            camera.position.lerp(

                new THREE.Vector3(

                    Math.sin(
                        time * 0.25
                    ) * radius,

                    1.1 +
                    Math.sin(
                        time * 0.35
                    ) * 0.5,

                    Math.cos(
                        time * 0.25
                    ) * radius

                ),

                0.025

            );

        }


        // =================================================
        // APPROACH EARTH
        // =================================================

        if (phase === "zoom") {

            camera.position.lerp(

                new THREE.Vector3(
                    0.7,
                    0.35,
                    4.2
                ),

                0.035

            );

        }


        // =================================================
        // FINAL APPROACH
        //
        // IMPORTANT:
        // Earth radius = 2.15
        //
        // Camera stays outside Earth.
        // =================================================

        if (phase === "accelerate") {

            camera.position.lerp(

                new THREE.Vector3(
                    0.15,
                    0.05,
                    3.0
                ),

                0.075

            );

        }


        // =================================================
        // ALWAYS LOOK AT EARTH
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
                SOFT SECONDARY LIGHT
            ================================================= */}

            <pointLight

                position={[
                    5,
                    -2,
                    4
                ]}

                intensity={5}

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

                speed={0.15}

            />


            {/* =================================================
                EARTH
            ================================================= */}

            <RealisticEarth />

        </>

    );

}



// =====================================================
// LANDING PAGE
// =====================================================

export default function Landing() {

    const navigate =
        useNavigate();


    const [
        phase,
        setPhase
    ] = useState("start");


    const [
        entered,
        setEntered
    ] = useState(false);


    // =================================================
    // ENTER ORBIT
    // =================================================

    const enterOrbit = () => {

        if (entered) {
            return;
        }


        setEntered(true);


        // ---------------------------------------------
        // START ORBIT
        // ---------------------------------------------

        setPhase("orbit");


        // ---------------------------------------------
        // APPROACH
        // ---------------------------------------------

        setTimeout(() => {

            setPhase("zoom");

        }, 1800);


        // ---------------------------------------------
        // FINAL APPROACH
        // ---------------------------------------------

        setTimeout(() => {

            setPhase("accelerate");

        }, 3800);


        // ---------------------------------------------
        // ENTER HOME
        // ---------------------------------------------

        setTimeout(() => {

            navigate("/home");

        }, 5200);

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
                THREE.JS CANVAS
            ================================================= */}

            <Canvas

                camera={{
                    position: [
                        0,
                        0.5,
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

                <Scene
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

                    <span
                        className="text-xl"
                    >
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
                HERO CONTENT
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
                        entered
                            ? "-translate-x-20 opacity-0"
                            : "opacity-100"
                    }
                `}
            >

                {/* ---------------------------------------------
                    SMALL LABEL
                --------------------------------------------- */}

                <p
                    className="
                        mb-4
                        text-sm
                        font-semibold
                        tracking-[0.35em]
                        text-orange-400
                    "
                >

                    YOUR UNIVERSE

                </p>


                {/* ---------------------------------------------
                    TITLE
                --------------------------------------------- */}

                <h1
                    className="
                        text-5xl
                        font-black
                        leading-[0.95]
                        sm:text-7xl
                    "
                >

                    DISCOVER.

                    <br />

                    DISCUSS.

                    <br />

                    <span
                        className="text-orange-500"
                    >
                        EXPLORE.
                    </span>

                </h1>


                {/* ---------------------------------------------
                    DESCRIPTION
                --------------------------------------------- */}

                <p
                    className="
                        mt-6
                        max-w-sm
                        text-lg
                        leading-7
                        text-slate-300
                    "
                >

                    Movies, technology, ideas
                    and people — all connected
                    in one Orbit.

                </p>


                {/* ---------------------------------------------
                    BUTTON
                --------------------------------------------- */}

                <button

                    onClick={enterOrbit}

                    disabled={entered}

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
                        hover:text-white

                        disabled:cursor-wait
                    "
                >

                    {
                        entered
                            ? "ENTERING ORBIT..."
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
                    "EARTH • ONLINE"
                }

                {phase === "orbit" &&
                    "ESTABLISHING ORBIT"
                }

                {phase === "zoom" &&
                    "APPROACHING EARTH"
                }

                {phase === "accelerate" &&
                    "ENTERING ORBIT"
                }

            </div>



            {/* =================================================
                TRANSITION FLASH
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
                        phase === "accelerate"
                            ? "opacity-80"
                            : "opacity-0"
                    }
                `}
            />

        </div>

    );

}