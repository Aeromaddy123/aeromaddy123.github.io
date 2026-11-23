# Workbench models — sources and licences

All files are real-scale (metres), converted to GLB and compressed for the web.

## Poly Haven — CC0 (no attribution required, credited anyway)
https://polyhaven.com/models
pliers, screwdriver, screwdrivers_02, adjustable_wrench, combination_wrench, cross_pein_hammer,
measuring_tape_01, tongue_groove_pliers, ratchet_wrench, magnifying_glass_01, Drill_01, drill_press_01,
bench_vice_01, desk_lamp_arm_01, metal_toolbox, metal_tool_chest, plastic_crate_01, plastic_crate_03,
industrial_pastic_container, cardboard_box_01, steel_frame_shelves_02, korean_fire_extinguisher_01,
medical_box, multi_cleaner_bottle, lubricant_spray, wooden_cutting_board, yellow_onion,
lemon, food_lime_01, food_apple_01, food_avocado_01, sweet_potato, carved_wooden_plate,
fish_knife, stationery_supplies

## FreeCAD Library — CC-BY 3.0, © the respective part authors
https://github.com/FreeCAD/FreeCAD-library
arduino-uno (Freaduino Uno), arduino-mega, arduino-nano (Nano Rev3), esp32-devkit (DOIT DevKit v1),
raspberry-pi-4 (Raspberry Pi 4B), raspberry-pico, stepper-driver (Pololu A4988), l298n, nema17,
sg90, servo-std (Futaba S3003), hc-sr04, gearmotor (yellow TT motor), wheel-65, calipers,
lcd-20x4, ssd (2.5" drive), estop-button, psu-brick (switching power supply), pi-camera
Changes: converted from STEP, decimated, recoloured to match the real boards.

## KiCad 3D models — CC-BY-SA 4.0 (with the KiCad design exception)
https://gitlab.com/kicad/libraries/kicad-packages3D
resistor, cap-electrolytic, cap-ceramic, transistor (TO-92), regulator (TO-220), ic-dip8, ic-dip28,
led, pin-header. Changes: converted from STEP.

## Robotics sources
- ender3 — Creality Ender-3 mechanical CAD, GPL-3.0, https://github.com/Creality3DPrinting/Ender-3
- robotiq-* — Robotiq 2F-85 visual meshes, BSD-2-Clause, https://github.com/ros-industrial-attic/robotiq
- realsense-d435 — Intel RealSense ROS description, Apache-2.0, https://github.com/IntelRealSense/realsense-ros
- turtlebot3 — ROBOTIS TurtleBot3 Burger meshes, Apache-2.0, https://github.com/ROBOTIS-GIT/turtlebot3
- rc-plane — PX4 SITL Gazebo "plane" model, BSD-3-Clause, https://github.com/PX4/PX4-SITL_gazebo-classic
- abb-irb120 — ABB IRB 120 visual meshes from ROS-Industrial abb_irb120_support, Apache-2.0, https://github.com/ros-industrial/abb
- quest-touch-l / quest-touch-r — WebXR Input Profiles (meta-quest-touch-plus), MIT,
  https://github.com/immersive-web/webxr-input-profiles. Trademarks belong to their owners.

## MuJoCo Menagerie (Google DeepMind) — reinforcement-learning projects
https://github.com/google-deepmind/mujoco_menagerie
- unitree-g1 — Unitree G1 humanoid (`unitree_g1`), BSD-3-Clause, © Unitree Robotics. Licence: models/bench/LICENSE-unitree-g1.txt
- aloha — ALOHA two-arm ViperX 300 S setup (`aloha`), BSD-3-Clause, © Trossen Robotics. Licence: models/bench/LICENSE-aloha.txt
Changes: visual meshes exported per body with tools/mjcf2gltf.py and simplified by vertex clustering. The motion on the workbench is hand-keyed.

## Sketchfab — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
Rescaled to the real products' dimensions, decimated and compressed; colours unchanged.

- oscilloscope — "Oscilloscope" by University of Wyoming Libraries (uwlibraries), https://sketchfab.com/3d-models/368c3efcb42e4f03bd41e59a7dab3718
- power-supply — "DC Power Supply" by VirtualUniversity (VirtualUniversity), https://sketchfab.com/3d-models/4fd610d6d43443f7ad5899d7d49a2d35
- soldering-station — "[CC0] Generic Soldering Station" by literallylara (literallylara), https://sketchfab.com/3d-models/87789d4f4c5b43069a5dd47819f4b4a8
- multimeter — "Multimeter" by PatrykKamionka (PatrykKamionka), https://sketchfab.com/3d-models/46d86e647f974484a84b90fd09a58bcb
- breadboard-kit — "[CC0] Set of Electronic Components" by literallylara (literallylara), https://sketchfab.com/3d-models/f4cb777b4ea3490587008e24b61bcf75
- transmitter — "Radiomaster TX12 rc radio controller" by 𝙁𝙇𝙄𝙂𝙃𝙏𝘾𝙇𝙐𝘽 (flightclubua), https://sketchfab.com/3d-models/0edc6bca739d4aa6952bb6b8747318bb
- lipo-4s — "Drone_Lipo_battery_4s" by 3dArenaRaj (3dArenaRaj), https://sketchfab.com/3d-models/2279697ec4b44d75813fd365d96a4e07
- lipo-bag — "Lipo Battery Safe Bag" by DrawingDoom (kimgd247), https://sketchfab.com/3d-models/f5356b9d5d2c4b318b403065b5f1e1cc
- fpv-goggles — "Rodin FPV Goggles DJI" by LINE-O (line-o), https://sketchfab.com/3d-models/56197e46626341acb8b7924494f9e8c9
- quest3-headset — "Meta Quest 3" by Elin (ElinHohler), https://sketchfab.com/3d-models/65a813833dc04eeeb7d33bdca58c184c
- monitor — "Desktop monitor (low-poly)" by LagzDesign (LagzDesign), https://sketchfab.com/3d-models/a30bb55b7e774b1fa696edbee9588835
- keyboard — "Logitech mechanical gaming keyboard" by BlackCube (blackcube4), https://sketchfab.com/3d-models/c775d45baf854606931584404d7b9109
- mouse — "Logitech M310 Mouse" by Nick Scott (Nickjjscott), https://sketchfab.com/3d-models/062b547dbd9a42ce94ff0c94ab9ce3af

## Provided by Kishan
- humanoid — "RoboSavvy Humanoid V2" STEP file supplied by Kishan; converted, decimated and compressed. Published with Kishan's confirmation that it may be shared.

## Built in code to published dimensions (bench-props.js)
Jetson Orin Nano dev kit, LiPo charger, fume extractor, helping hands, logic analyser, hot-air station,
UR teach pendant and control box, laptop, network switch, tabletop tripod, ESD and cutting mats,
parts drawers, solder / wire / filament spools, ChArUco board, robot mounting plate, benches and pegboards.
