import {t,isFr,onLang,colon} from './i18n.js';
import * as FR from './content-fr.js';
import {reveal} from './loading.js';
import './rail.js';
import './transitions.js';
import './autoscroll.js';
import './ros-console.js';
import {openBook} from './book.js';
const projects = [
  {id:'balancer',name:'Self-balancing robot', field:'Embedded control', text:'For my MSc R&D project at ESIGELEC, I built a two-wheeled robot around an Arduino Nano and a Raspberry Pi. The Nano runs the balance controller while the Pi handles perception and higher-level commands.', video:'./videos/robot-demo-1.mp4', caption:'Self-balancing robot · prototype footage'},
  {id:'uav',name:'Medical UAV', field:'Flight systems', text:'I integrated a Pixhawk flight controller with a Raspberry Pi companion computer for a medical-delivery quadcopter. The project brought together waypoint navigation, onboard electronics and telemetry.', video:'./videos/quadcopter-demo.mp4', caption:'Medical quadcopter · project footage'},
  {id:'veggie',name:'VeggieBot · UR16e', field:'Robot learning', text:'At CESI LINEACT with IMT Atlantique, I worked on teaching a UR16e kitchen manipulation from human demonstrations. My work connected teleoperation, camera recording, policy training and testing on the physical robot.',video:'./assets/veggiebot-demo.mp4',caption:'Front camera · recorded VeggieBot demonstration, October 2026'},
  {id:'arm',name:'Bionic prosthetic arm', field:'Medical robotics', text:'I designed a servo-actuated, 3D-printed prosthetic arm with a custom EMG sensor circuit that reads muscle signals from the residual limb to control the grip. The parts cost under €50, the design is filed as an Indian patent application, and the work was published in AIP Conference Proceedings.', video:'./videos/bionic-arm-demo.mp4', caption:'Bionic prosthetic arm · prototype footage'},
  {id:'handover',name:'Two-arm handover · RL', field:'Reinforcement learning', text:'Two robot arms in MuJoCo learn from scratch, by trial and error, to pick up a block, pass it between them and place it on a target. After 50 million simulation steps (41 minutes on one GPU), 100% of test attempts pass the block across and 89% deliver it on target.', video:'./assets/book/rl-handover-policy.mp4', caption:'The learned policy · MuJoCo simulation'},
  {id:'g1',name:'Humanoid G1 · walk to run', field:'Reinforcement learning', text:'A Unitree G1 humanoid in MuJoCo teaches itself to walk in 96 million practice steps, then, starting from that walking robot, learns to run at about 2.1 m/s with both feet leaving the ground.', video:'./assets/book/rl-g1-run.mp4', caption:'The running policy · MuJoCo simulation'}
];
// Skills, grouped by engineering area and named in general terms.
const skillGroups=[
  {area:'Robot learning & AI',icon:'spark',skills:['Robot learning','Reinforcement learning','Imitation learning','Vision-language-action models (VLA)','World models','Robot foundation models','Sim-to-real transfer','Policy training & evaluation','Model fine-tuning (LoRA)','Machine learning','Deep learning','Large language models (LLMs)','Multimodal AI','Edge & offline AI','Dataset collection & curation']},
  {area:'Robotics & control',icon:'robot',skills:['Robotics','Robot manipulation','Humanoid robots','Legged locomotion','Mobile robots','Control systems','Motion control','Motor control','Kinematics & dynamics','Path & motion planning','Localization & mapping (SLAM)','Navigation','Teleoperation','Robot simulation','Mechatronics','Actuators & encoders']},
  {area:'Embedded systems',icon:'chip',skills:['Embedded software','Firmware development','Microcontrollers','Real-time operating systems','Embedded Linux & device drivers','Communication protocols','IoT & M2M','Low-level programming','FPGA & SoC design','Digital signal processing']},
  {area:'Electronics',icon:'bolt',skills:['Circuit design','PCB design','Analog & digital electronics','Sensors & instrumentation','Signal conditioning','Motor drives','Electromagnetic compatibility (EMC)','Hardware debugging','Soldering & prototyping']},
  {area:'Perception & vision',icon:'eye',skills:['Computer vision','Image processing','Object detection','Camera calibration','Multi-camera systems','Sensor fusion','Speech recognition']},
  {area:'Mechanical design & manufacturing',icon:'cube',skills:['Mechanical design','CAD modelling','Mechanism & gear design','Tolerance analysis','Design for manufacturing','3D printing','Rapid prototyping','CNC machining','Laser cutting','FEA & CFD simulation','Aerodynamics','Drone & UAV design']},
  {area:'Testing, safety & automation',icon:'shield',skills:['Testing & validation (V&V)','Hardware-in-the-loop testing','V-cycle development','Functional safety','MISRA C','Industrial automation','PLC programming','System integration','Debugging & troubleshooting']},
  {area:'Software & tools',icon:'terminal',skills:['Python','C','C++','Embedded C','Java','MATLAB / Simulink','LabVIEW','ROS 2','PyTorch','LeRobot','NVIDIA Isaac Sim','MuJoCo','OpenCV','Linux','Git','Docker','CI/CD','SolidWorks','ANSYS','KiCad','VHDL','Android','Web (HTML, CSS, JS)']},
  {area:'Leadership & languages',icon:'people',skills:['Team leadership','Robotics teaching & mentoring','Project management','Research & publications','Technical presentations','English','French (B1)','Hindi']}
];
// Publications and the patent application (titles and DOIs from the papers themselves).
const research=[
  {type:'Conference paper',title:'Design and fabrication of low-cost prosthetic arm',venue:'AIP Conference Proceedings',year:'2024',role:'First author',link:'https://doi.org/10.1063/5.0192243',text:'The 3D-printed bionic arm with EMG-based grip control, built for about €50 in parts.'},
  {type:'Journal paper',title:'Aerodynamic and bending analysis of low-speed airfoils at Reynolds number 300,000',venue:'Materials Today: Proceedings',year:'2023',role:'Co-author',link:'https://doi.org/10.1016/j.matpr.2022.09.381',text:'B.Tech research comparing low-speed airfoils for small aircraft and UAVs.'},
  {type:'Patent application',title:'Bionic arm',venue:'Indian patent application No. 202311042415',year:'2023',role:'Inventor',text:'Customizable prosthetic arm design, filed with Lovely Professional University.'}
];
// Competition wins, with their certificates.
const awards=[
  {place:'1st Prize',title:'Hover-Rumble',event:'PECFEST, Punjab Engineering College',date:'November 2019',tier:'gold',image:'./assets/certs/hover-rumble.jpg'},
  {place:'2nd Prize',title:'Drone Challenge',event:'PECFEST, Punjab Engineering College',date:'November 2019',tier:'silver',image:'./assets/certs/drone-challenge.jpg'},
  {place:'1st Position',title:'Cozmo-Clench',event:'Techfest, IIT Bombay',date:'January 2020',tier:'gold',image:'./assets/certs/cozmo-clench.jpg'},
  {place:'1st Position',title:'Roborace',event:'PLINTH, LNMIIT Jaipur',date:'January 2020',tier:'gold',image:'./assets/certs/roborace.jpg'},
  {place:'3rd Position',title:'AeroVaccine Challenge',event:'Techfest, IIT Bombay',date:'2021',tier:'bronze',image:'./assets/certs/aerovaccine.jpg'},
  {place:'1st Place',title:'SolidWorks Design Challenge',event:"St. Joseph's College",date:'2021',tier:'gold',image:'./assets/certs/solidworks.jpg'}
];
// Experience timeline, in order; the 3D robot rolls between these stations.
const journey=[
  {years:'2018 – 2022',title:'B.Tech in Mechanical Engineering',org:'Lovely Professional University, India',text:'Specialised in robotics and automation. Built drones, a 5-DOF arm and a bionic prosthetic arm, and served as technical head of the university robotics community.'},
  {years:'Jul 2022 – Oct 2023',title:'Robotics Trainer',org:'Witty International School, India',text:'Taught electronics, CAD, 3D printing, programming and robot, drone and mechanism building to more than 900 students, and guided over ten student projects to working prototypes.'},
  {years:'Oct 2023 – Oct 2024',title:'Assistant Technical Manager',org:'Learning Links Foundation, Mumbai',text:'Developed educational robotics kits from mechanical design and electronics to firmware and manufacturing, and led a team of 12 engineers building gesture-controlled drones and IoT humanoid robots.'},
  {years:'Sep 2024 – Dec 2026',title:'MSc in Electronic Embedded Systems',org:'ESIGELEC, Rouen, France',text:'Embedded C, real-time operating systems, SoC design and embedded Linux. Ranked first in C programming, real-time operating systems and the R&D project: my self-balancing robot.'},
  {years:'2026 – present',title:'Robotics Research Intern',org:'CESI LINEACT × IMT Atlantique, Rouen',text:'VeggieBot: teaching a UR16e kitchen tasks from human demonstrations, with Quest teleoperation, multi-camera data capture on a Jetson, and VLA policies such as π0.5 and SmolVLA tested on the real robot.'}
];

// Project books: a hardback with a cover photo; each spread pairs a video (left page)
// with the story (right page). Facts only from Kishan's own notes and footage.
const books={
  balancer:{
    title:'Self-balancing robot',number:'01',subtitle:'MSc R&D project · ESIGELEC · Dec 2025 – Jan 2026',
    cover:'./assets/book/balancer-cover.jpg',coverAlt:'The self-balancing robot on a wooden floor, with LiDAR, camera and ultrasonic sensors',
    spreads:[
      {video:'./videos/robot-demo-1.mp4',poster:'./assets/book/robot-demo-1-poster.jpg',w:1080,h:1080,
       caption:'Talking to the robot. A spoken request — “Can you move forward for me?” — is turned by the AI layer into a drive command, and the robot rolls off.',
       kicker:'The project',title:'A robot that stands on two wheels — and listens',
       body:['A two-wheeled robot is an inverted pendulum: it is always about to fall. It stays upright only by driving its wheels back under its centre of mass, over and over, every fraction of a second.',
             'I built it as my final-year <b>MSc R&amp;D project at ESIGELEC</b>, with one goal beyond balancing: give it <b>embedded AI</b>, so you can simply tell it what to do.',
             {specs:[['Balance & motors','Arduino Nano'],['Vision & AI','Raspberry Pi'],['Sensing','IMU, camera, LiDAR, ultrasonic'],['Electronics','Custom PCB']]}]},
      {video:'./videos/robot-demo-3.mp4',poster:'./assets/book/robot-demo-3-poster.jpg',w:478,h:850,
       caption:'A walk around the hardware: LiDAR on top, the camera, two ultrasonic sensors, the wheels and motor drive, and the electronics stack — driven from a laptop.',
       kicker:'How it works',title:'Two brains, one body',
       body:['The work is split between two computers, each doing what it is best at.',
             {list:['<b>Arduino Nano — reflexes.</b> It reads the IMU, estimates how far the robot is tilting, and runs the state-feedback (LQR) balance loop that drives the motors to catch the fall.',
                    '<b>Raspberry Pi — the brain.</b> It handles the camera, the LiDAR and the AI, decides where to go, and sends simple commands to the Nano over a serial link.',
                    '<b>Custom PCB.</b> One board ties the IMU, motor drivers, Nano and Pi together, so the wiring stays short and the robot stays compact.']},
             'Keeping the fast balance loop on its own microcontroller means nothing the Pi does — vision, mapping or AI — can ever make the robot fall over.']},
      {video:'./videos/robot-demo-2.mp4',poster:'./assets/book/robot-demo-2-poster.jpg',w:1080,h:1080,
       caption:'Seeing people. The Pi camera tracks a person’s pose with MediaPipe — the input for human following.',
       kicker:'What it can do',title:'Four ways to drive it',
       body:[{list:['<b>Manual.</b> Driven from a laptop over Wi-Fi; the Pi relays each command to the Nano.',
                    '<b>Human following.</b> MediaPipe tracks a person in the camera image, and the robot decides to move forward, back, left or right to stay with them.',
                    '<b>Mapping and navigation.</b> The LiDAR scans the room so the robot can map it and drive from A to B on its own.',
                    '<b>AI control.</b> Tell it what you want in plain language: the AI understands the request, calls the robot through an API, and controls the whole robot.']},
             {chips:['Inverted-pendulum control','LQR & PID tuning','IMU sensing','Motor drive','Custom PCB','Arduino & embedded C','Raspberry Pi & Python','MediaPipe vision','LiDAR SLAM','LLM integration']}]}
    ]
  },
  uav:{
    title:'Medical delivery quadcopter',number:'02',subtitle:'Autonomous UAV · 2021 — and an RL pilot in simulation · 2026',
    cover:'./assets/book/quad-real.jpg',coverAlt:'The medical quadcopter on the floor',
    spreads:[
      {video:'./videos/quadcopter-demo.mp4',poster:'./assets/book/uav-poster.jpg',w:1080,h:1964,
       caption:'Night flight and the radio transmitter used to fly it.',
       kicker:'The project',title:'A drone built to carry medicine',
       body:['An autonomous quadcopter designed to fly medical supplies where roads are slow or blocked.',
             'I integrated a <b>Pixhawk</b> flight controller with a <b>Raspberry Pi 3</b> companion computer, so the drone could fly a planned route on its own while the Pi handled the higher-level mission.',
             {specs:[['Flight control','Pixhawk'],['Companion','Raspberry Pi 3 (SPI)'],['Navigation','GPS + IMU fusion'],['Telemetry','GSM'],['Ground station','Mission Planner']]}]},
      {image:'./assets/book/quad-cad.jpg',w:1100,h:572,
       caption:'The airframe in CAD before it was built.',
       kicker:'How it works',title:'From CAD to waypoints',
       body:[{list:['<b>Design.</b> The frame was modelled in CAD first, then built and wired.',
                    '<b>Fusion.</b> GPS and IMU data are fused so the drone knows where it is and how it is oriented.',
                    '<b>Missions.</b> Waypoint routes are planned in Mission Planner and flown autonomously.',
                    '<b>Link.</b> GSM telemetry keeps the drone in contact beyond radio range.']},
             'It is one of the more than six types of drones I have built.',
             {chips:['Drone & UAV design','Pixhawk / ArduPilot','Raspberry Pi','Sensor fusion','Waypoint navigation','Telemetry','CAD modelling']}]},
      // Part two: the 2026 reinforcement-learning drone in MuJoCo (RL_Drone_Nav project).
      {video:'./assets/book/rl-drone-map.mp4',poster:'./assets/book/rl-drone-map-poster.jpg',w:544,h:680,
       caption:'Mapping flight: the lidar builds a 3D map of the hills and trees, and the camera finds the five landing pads. Then the pilot learns in random forests.',
       kicker:'Part two · Reinforcement learning',title:'A drone that maps a forest',
       body:['In 2026 I came back to drones with reinforcement learning. In MuJoCo, a <b>Skydio X2</b> quadcopter surveys 120 × 120 m of hills and forest, then flies itself to whichever checkpoint you type.',
             {list:['<b>Map.</b> A lawn-mower flight at 24 m: a downward lidar maps the ground, the trees and the rocks, and the camera spots the five numbered pads.',
                    '<b>Plan.</b> A* on that map, on two levels: 3.5 m above the ground between the trees, or over the canopy when there is no way through.',
                    '<b>Fly.</b> A pilot trained with reinforcement learning follows the route, avoids obstacles and lands.']}]},
      {video:'./assets/book/rl-drone-fly.mp4',poster:'./assets/book/rl-drone-fly-poster.jpg',w:544,h:680,
       caption:'“Go to 3”: the planned route between the trees (cyan), the point the pilot is chasing (yellow), and the landing on pad 3.',
       kicker:'The learned pilot',title:'Type a number, it flies there and lands',
       body:['The pilot is a neural network trained with <b>PPO</b> in thousands of random forests on two GPUs. It sees <b>154 lidar beams</b>, its motion sensors and the next route points, and sends thrust and rotation rates to a standard flight controller.',
             {stats:[['377 M','steps in 19 min'],['95 %','landings in training'],['14 / 14','test flights landed'],['5–51 cm','from the pad centre']]},
             {links:[{label:'Code on GitHub',href:'https://github.com/Aeromaddy123/drone-lidar-nav-rl'}]},
             {chips:['Reinforcement learning (PPO)','MuJoCo','Lidar mapping','Autonomous landing']}]}
    ]
  },
  veggie:{
    title:'VeggieBot',number:'03',subtitle:'Robot learning · CESI LINEACT × IMT Atlantique · 2026',
    cover:'./assets/book/veggie-45.jpg',coverAlt:'The UR16e with a Robotiq gripper over the work table',
    // Clips are cut from Kishan's own walkthrough video (17 Nov 2026), with his narration;
    // facts and numbers come from his internship final report.
    spreads:[
      {video:'./assets/book/veggie-workcell.mp4',poster:'./assets/book/veggie-workcell-poster.jpg',w:540,h:960,
       caption:'The workcell: the gripper with its wrist camera, the bottle and bowl on the marked table, and the cameras around it. Turn the sound on for my narration.',
       kicker:'The project',title:'Teaching an industrial arm to cook',
       body:['My internship at <b>CESI LINEACT with IMT Atlantique</b> (May – November 2026): make a <b>UR16e</b> industrial arm learn from human demonstrations with vision-language-action (VLA) models, then use it for a cooking task.',
             'Only the robot was supplied. I designed and built everything around it: the cameras, VR teleoperation, a data recorder, the datasets, model training and a gateway that runs the trained model on the real arm.',
             'Three cameras watch the table: a <b>wrist camera</b> sees the fingers open and close, a <b>top camera</b> gives the model an overview, and an <b>isometric camera</b> shows the whole robot. If one view is blocked, the other two keep the predictions going.',
             {specs:[['Robot','UR16e + Robotiq 2F-85'],['Cameras','2 × RealSense D435i + wrist camera'],['Supervisors','Fabrice Duval (CESI) · Youssef Mourchid (IMT Atlantique)'],['Result','16 of 18 complete bottle sequences']]}]},
      {video:'./assets/book/veggie-network.mp4',poster:'./assets/book/veggie-network-poster.jpg',w:540,h:960,
       caption:'The robot controller, the Jetson, the network switch, the laptops and the Quest 3S headset, all on one network.',
       kicker:'The setup',title:'Wiring the workcell',
       body:['A VLA sees camera images, reads the robot’s joint state and an instruction such as <i>“Pick up the bottle”</i>, and predicts the next joint targets and gripper command. Before any of that, every device has to talk to the others.',
             {list:['<b>Jetson Orin Nano: the local computer.</b> All three cameras plug into it, and it drives the UR16e over Ethernet using RTDE.',
                    '<b>RODeep: the lab’s GPU workstation.</b> It trains the models and serves them during tests, reached from the Jetson over SSH.',
                    '<b>Quest 3S and laptops</b> join the same network, so the gateways can be opened from any device.']},
             'Keeping robot control local and heavy computation remote means camera capture and motor commands never wait on the model, or on my laptop.']},
      {video:'./assets/book/veggie-teleop.mp4',poster:'./assets/book/veggie-teleop-poster.jpg',w:540,h:540,
       caption:'Seen through the Quest 3S in passthrough: hold the clutch, then move the arm left, right, forward, back, up and down.',
       kicker:'Step 1 · Teleoperation',title:'Showing the robot how',
       body:['To learn, a model needs examples. I built a teleop gateway so I could drive the UR16e with the <b>Quest 3S</b> controllers: open the gateway link in the headset’s browser, enter WebXR, and the controller’s motion becomes the robot’s motion.',
             {list:['<b>Clutch.</b> The arm moves only while it is held. Let go and it stops.',
                    '<b>Two modes.</b> Move the gripper through space, or hold a button and steer one joint at a time.',
                    '<b>Gripper and home.</b> One button closes the fingers; the centre button returns the arm to a fixed home pose.',
                    '<b>Tuned to the task.</b> Adjustable speed and direction, recording shortcuts, and spare buttons I mapped to task-specific motions.']},
             'Status lights for the browser connection, headset tracking, controller input and robot feedback show at a glance where a problem is.']},
      {video:'./assets/book/veggie-recorder.mp4',poster:'./assets/book/veggie-recorder-poster.jpg',w:540,h:540,
       caption:'The recorder gateway: all 13 preflight checks pass (cameras, RTDE, socket, gripper and Quest), so recording can start.',
       kicker:'Step 2 · Raw recorder',title:'Recording every demonstration',
       body:['A demonstration is more than a video. My <b>raw-recorder gateway</b> runs on the Jetson and handles collection from one page: live camera views, task details, start and stop.',
             'Before recording, <b>13 preflight checks</b> confirm the ROS 2 stack, the front, top and wrist cameras, RTDE without gaps, the socket, the gripper and the Quest.',
             {list:['<b>Saved:</b> images from all three cameras, joint and tool measurements, gripper command and feedback, timestamps and task metadata.',
                    '<b>Reviewed:</b> validation checks, joint plots, the three videos and a 3D replay of the recorded joints, before an episode joins a dataset.',
                    '<b>Stored safely:</b> buffered on the Jetson, then copied to the archive and verified with checksums, so recording never waits on a slow drive.']},
             {stats:[['≈ 400','bottle demonstrations'],['116,769','frames in the 383-episode grasp dataset']]}]},
      {image:'./assets/book/veggie-block-trial.jpg',w:960,h:720,
       caption:'Pi0.5 controlling the arm in a block-grasp trial on 2 October 2026: approach, grip and lift.',
       kicker:'Step 3 · Training',title:'Choosing the model',
       body:['I first proved the whole pipeline on a simple block-picking task, then compared three models over nine physical trials each:',
             {stats:[['3 / 9','ACT'],['≈ 8 / 9','SmolVLA'],['9 / 9','Pi0.5']]},
             'Pi0.5 became the main model. For the bottle task I fine-tuned it with <b>OpenPI and LoRA</b> on two GPUs:',
             {list:['<b>In:</b> three camera views at 224 × 224, six joint angles and the gripper value.',
                    '<b>Out:</b> ten future targets, from 0.3 to 1.2 s ahead.',
                    '<b>Selection:</b> training ran to five epochs (291,923 updates); offline checks on a held-out episode compared the saved checkpoints before any physical test.']},
             'I also explored OpenVLA and NVIDIA GR00T along the way.']},
      {video:'./assets/book/veggie-gateway.mp4',poster:'./assets/book/veggie-gateway-poster.jpg',w:540,h:540,
       caption:'The inference gateway: picking the checkpoint, here Pi0.5 trained on about 400 bottle demonstrations.',
       kicker:'Step 4 · Inference',title:'The inference gateway',
       body:['Once a model is trained, the inference gateway runs it on the real arm without opening a terminal. It shows the live cameras, robot and gripper status, the chosen model and the motion settings.',
             {list:['<b>The loop.</b> The Jetson sends images and robot state to the model on RODeep, gets back a chunk of future actions, checks how fresh they are, and executes them locally at 50 Hz.',
                    '<b>Jerk filter.</b> Raw predictions moved abruptly, so I added a Ruckig trajectory layer that limits velocity, acceleration and jerk. I usually run it at 0.15.',
                    '<b>Safe testing.</b> A no-motion practice mode, automatic preflights before each test, a stop button, and a recording of every trial.',
                    '<b>Human in the loop.</b> Teleop runs alongside, so the operator can pause the model and take over.']},
             'I also integrated real-time chunking (RTC) as an experiment; ordinary Pi0.5 with the jerk filter moved better on the robot.']},
      {video:'./assets/book/veggie-vla.mp4',poster:'./assets/book/veggie-vla-poster.jpg',w:540,h:540,
       caption:'No one is controlling the arm: Pi0.5 reaches for the bottle and grasps it using only live camera images.',
       kicker:'Step 5 · Autonomy',title:'The robot on its own',
       body:['After <b>Start test</b>, only the model drives the arm: fresh images in, joint targets out. It approaches the bottle, closes the gripper and lifts it.',
             'The model has no “done” signal, so I added a completion rule based on gripper feedback. Once the fingers hold steady in the grip range for ten seconds, the pickup stops, the arm pauses, and the next stage begins.',
             'I split the task into stages instead of training one long episode, so the hardest part, finding and grasping the bottle, is the learned part.']},
      {video:'./assets/book/veggie-pour.mp4',poster:'./assets/book/veggie-pour-poster.jpg',w:540,h:540,
       caption:'After the learned grasp, the arm carries the bottle to the bowl, tilts it to pour and brings it back.',
       kicker:'Step 6 · The cooking action',title:'Pick, pour and put back',
       body:['The full task: pick up the bottle, carry it to the bowl, pour, and put it back. The learned pickup hands over to a recorded demonstration that carries, pours and returns the bottle at its original timing, then opens the gripper to release it.',
             {stats:[['16 / 18','complete sequences'],['88.9%','success rate']]},
             'It is a hybrid: the grasp is learned, the pour is recorded. That complete system succeeded in 16 of 18 attempts, as confirmed by the operator.',
             'The platform is ready for more: varied scenes, stronger lift detection, recovery demonstrations, and new utensils and cooking actions.']},
      {doc:'./assets/docs/VeggieBot-CESI-Main-Report.pdf',image:'./assets/book/veggie-report-cover.jpg',w:911,h:1287,
       caption:'Internship final report (PDF, 48 pages).',
       kicker:'Read more',title:'The full report',
       body:['<i>Development of a Hardware and Software Platform for Vision-Language-Action Learning on a UR16e</i>: my final internship report for CESI and IMT Atlantique.',
             {list:['Building the robot setup','Collecting and preparing demonstrations','Training and choosing a model','Running the model on the robot','From bottle pickup to a cooking action','Results, and how to continue']},
             {links:[{label:'Read the report',href:'./assets/docs/VeggieBot-CESI-Main-Report.pdf'},{label:'Download PDF',href:'./assets/docs/VeggieBot-CESI-Main-Report.pdf',download:'Kishan-Chhari-VeggieBot-Report.pdf'}]},
             {chips:['Robot learning','VLA models','Pi0.5 · SmolVLA · ACT','LoRA fine-tuning','VR teleoperation (WebXR)','ROS 2','RTDE','Multi-camera data capture','NVIDIA Jetson','Trajectory smoothing','Python']}]}
    ]
  },
  arm:{
    title:'Bionic prosthetic arm',number:'04',subtitle:'Low-cost 3D-printed prosthesis · 2022–2023',
    cover:'./assets/book/arm-cover.jpg',coverAlt:'The bionic hand gripping a bottle',
    spreads:[
      {video:'./videos/bionic-arm-demo.mp4',poster:'./assets/book/arm-poster.jpg',w:1080,h:1920,
       caption:'The hand closing around a bottle and holding it.',
       kicker:'The project',title:'A hand that costs less than a phone',
       body:['A customizable, 3D-printed prosthetic arm with articulated fingers and thumb, built so that people who need one can actually afford it.',
             'Servo motors pull tendon-like cables to close the fingers, and a custom <b>EMG sensor circuit</b> reads muscle signals from the residual limb to control the grip.',
             {specs:[['Build','3D-printed, articulated fingers & thumb'],['Actuation','Servos with tendon transmission'],['Control','EMG muscle sensing'],['Parts cost','Under €50']]}]},
      {image:'./assets/book/bionic-arm-drawing.jpg',w:635,h:868,
       caption:'Engineering drawing of the hand and forearm.',
       kicker:'Outcome',title:'Published and filed',
       body:['The design was published as a first-author paper, <i>Design and fabrication of low-cost prosthetic arm</i>, in AIP Conference Proceedings (2024), and filed as <b>Indian patent application 202311042415</b>.',
             {list:['<b>Mechanical design</b> of the fingers, thumb and forearm in CAD.','<b>Electronics</b>: EMG signal conditioning and servo drive.','<b>Firmware</b> that turns muscle activity into a grip.']},
             {chips:['Medical robotics','CAD modelling','3D printing','EMG sensing','Signal conditioning','Servo control']}]}
    ]
  },
  handover:{
    title:'Two-arm handover',number:'05',subtitle:'Reinforcement learning in simulation · 2026',
    cover:'./assets/book/handover-cover.jpg',coverAlt:'Two black robot arms over a wooden table, one holding a red block',
    // Facts from the project's README and results (github.com/Aeromaddy123/bimanual-handover-rl).
    spreads:[
      {video:'./assets/book/rl-handover-scene.mp4',poster:'./assets/book/rl-handover-scene-poster.jpg',w:544,h:680,
       caption:'The scene: two arms, one block. Then 8,192 copies of it train at the same time on one GPU.',
       kicker:'The project',title:'Two arms, one block, no demonstrations',
       body:['Two robot arms learn, from scratch and by trial and error, to <b>pick up a block, hand it from one arm to the other in the air, and put it down on a target</b>.',
             'Nobody shows them how. The only teacher is a reward, and the arms practise in thousands of simulated copies at once.',
             {specs:[['Robots','Two ViperX 300 S arms (ALOHA)'],['Simulator','MuJoCo MJX + JAX'],['Algorithm','PPO'],['Parallel worlds','8,192 on one GPU']]}]},
      {video:'./assets/book/rl-handover-learning.mp4',poster:'./assets/book/rl-handover-learning-poster.jpg',w:544,h:680,
       caption:'Training time-lapse: steps, training time and the success rate measured at each checkpoint.',
       kicker:'How it learned',title:'From flailing to 89 %',
       body:['Early attempts are random: missed grabs and dropped blocks. The first handovers appear after about 20 million steps. By 33 million, every attempt passes the block across.',
             {stats:[['50.1 M','simulation steps'],['41 min','on one RTX A4000'],['100 %','pass the block across'],['89 %','deliver it on target']]},
             'Tested on 256 attempts. “Delivered” means within 5 cm of the target, held there for the last second.']},
      {video:'./assets/book/rl-handover-policy.mp4',poster:'./assets/book/rl-handover-policy-poster.jpg',w:544,h:680,
       caption:'The learned policy: pick up, pass, let go, deliver.',
       kicker:'What I learned',title:'The reward is the real design work',
       body:['My first try used two Franka arms and my own hand-written reward. The agent kept finding shortcuts:',
             {list:['It gripped the bar but never lifted it: gripping alone already paid.','It tipped the bar up by one end to fake a lift.','It held the bar level, still on the table.']},
             'What worked was the reward from DeepMind’s MuJoCo Playground handover task: it pays only for <b>new progress</b>, so standing still earns nothing.',
             {links:[{label:'Code on GitHub',href:'https://github.com/Aeromaddy123/bimanual-handover-rl'}]},
             {chips:['Reinforcement learning (PPO)','Reward design','MuJoCo MJX','Bimanual manipulation']}]}
    ]
  },
  g1:{
    title:'Humanoid: walk, then run',number:'06',subtitle:'Unitree G1 · reinforcement learning in simulation · 2026',
    cover:'./assets/book/g1-cover.jpg',coverAlt:'The Unitree G1 humanoid running down a tree-lined avenue',
    spreads:[
      {video:'./assets/book/rl-g1-walk.mp4',poster:'./assets/book/rl-g1-walk-poster.jpg',w:544,h:680,
       caption:'Step 0: it falls straight away. Then attempt after attempt as training goes on, until it walks. Turn the sound on for the narration.',
       kicker:'The project',title:'A humanoid that taught itself to walk',
       body:['A <b>Unitree G1</b> humanoid in MuJoCo learns to walk with reinforcement learning, starting from nothing: at step 0 it falls straight away.',
             'It is rewarded for following the speed it is asked for and staying upright. Small sideways pushes during training teach it to catch itself.',
             {stats:[['96 M','practice steps'],['42 min','on two GPUs'],['49 / 49','test robots stayed up'],['0.75 m/s','walking speed']]},
             {links:[{label:'Code on GitHub',href:'https://github.com/Aeromaddy123/humanoid-walk-to-run-rl'}]}]},
      {video:'./assets/book/rl-g1-run.mp4',poster:'./assets/book/rl-g1-run-poster.jpg',w:544,h:680,
       caption:'Teaching it to run: what changed, the moment both feet leave the ground, and the run at full speed.',
       kicker:'Part two',title:'From walking to running',
       body:['I started from the walking robot, not from scratch, and changed what it was asked to do:',
             {list:['<b>Speed limit</b> 1 → 4 m/s.','<b>Step rhythm</b> 1.4 → 2.5 steps per second.','<b>Foot lift</b> 15 → 25 cm.','A reward for <b>both feet leaving the ground</b>, so it runs instead of power-walking.']},
             {stats:[['2.1 m/s','about 7.5 km/h, 3× its walk'],['24–27 %','of the time in the air'],['0','falls in testing']]},
             'It took about 90 million more practice steps in three rounds; the last 46 million produced the true run.',
             {chips:['Reinforcement learning (PPO)','Legged locomotion','Reward shaping','Humanoid robots']}]}
    ]
  }
};
const dialog = document.querySelector('#detail');
const inside = document.querySelector('#inside');
let opener;
function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}
function openDetail(content, button, isBook=false) {
  opener=button;
  inside.replaceChildren(content);
  dialog.classList.toggle('book-dialog',isBook);
  // A second quick click replaces the open card instead of reopening the dialog.
  if(!dialog.open)dialog.showModal();
}
// ── Language ─────────────────────────────────────────────────────────────
// The arrays above are the English source. Switching to French copies the French
// text (content-fr.js) over them in place, so every renderer and the 3D scene keep
// working from the same objects; switching back restores the English snapshot.
const DATA={projects,skillGroups,research,awards,journey};
const EN=structuredClone(DATA);
function applyLanguage(){
  const fr=isFr();
  for(const [key,list] of Object.entries(DATA))list.forEach((item,i)=>{
    Object.assign(item,EN[key][i]);
    if(fr&&FR[key]?.[i])Object.assign(item,FR[key][i]);
  });
}
// A book in the current language: French text laid over the English spreads,
// keeping their media, sizes and link targets.
function bookFor(id){
  const en=books[id],fr=isFr()&&FR.books[id];
  if(!en||!fr)return en;
  return {...en,...fr,spreads:en.spreads.map((s,i)=>{
    const f=fr.spreads[i];if(!f)return s;
    const enLinks=s.body.find(b=>b.links)?.links||[];
    const body=(f.body||s.body).map(b=>b&&b.links?{links:b.links.map((l,j)=>({...enLinks[j],...l}))}:b);
    return {...s,...f,body};
  })};
}
applyLanguage();
function openProject(index, button) {
  const book=bookFor(projects[index].id);
  if(book){openBook(book,button);return;}
  const p=projects[index], article=el('article',null,'project-detail');
  const title=el('h2',p.name); title.id='detail-title';
  const video=el('video'); video.src=p.video; video.controls=true; video.playsInline=true; video.preload='metadata'; video.setAttribute('aria-label',p.caption);
  article.append(el('p',p.field,'kicker'),title,el('p',p.text),video,el('p',p.caption,'credit'));
  openDetail(article,button);
}
const pins=projects.map((p,i)=>{
  const b=el('button',p.name,'pin'); b.type='button'; b.onclick=()=>openProject(i,b);
  document.querySelector('#hotspots').append(b);return b;
});
// Skills page: one card per area, skills as tags (like the previous portfolio).
const ICONS={
  spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  robot:'<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M8 4h8M9 13h.01M15 13h.01M9 17h6"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  cube:'<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 22V12"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  terminal:'<path d="m4 17 6-6-6-6M12 19h8"/>',
  people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-3-5.5"/>'
};
const skillGrid=document.querySelector('#skill-grid');
function renderSkills(){
  skillGrid?.replaceChildren(...skillGroups.map(group=>{
    const card=el('article',null,'skill-card');
    const head=el('h3',null,'skill-area');
    head.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[group.icon]}</svg>`;
    head.append(group.area);
    const list=el('ul',null,'skill-tags');
    group.skills.forEach(skill=>list.append(el('li',skill)));
    card.append(head,list);return card;
  }));
}
const researchGrid=document.querySelector('#research-grid');
function renderResearch(){
  researchGrid?.replaceChildren(...research.map(r=>{
    const card=el('article',null,'research-card');
    card.append(el('p',`${r.type} · ${r.year}`,'research-type'),el('h4',r.title),el('p',`${r.venue} · ${r.role}`,'research-venue'),el('p',r.text,'research-text'));
    if(r.link){const a=el('a',t('Read the paper ↗'),'research-link');a.href=r.link;a.target='_blank';a.rel='noopener';card.append(a);}
    return card;
  }));
}
const awardGrid=document.querySelector('#award-grid');
function renderAwards(){
  awardGrid?.replaceChildren(...awards.map(a=>{
    const b=el('button',null,'award-card');b.type='button';b.dataset.tier=a.tier;
    const img=el('img');img.src=a.image;img.alt='';img.loading='lazy';
    b.append(img,el('span',a.place,'award-place'),el('strong',a.title),el('span',`${a.event} · ${a.date}`,'award-event'));
    b.setAttribute('aria-label',`${a.place}, ${a.title}${colon()} ${t('view certificate')}`);
    b.onclick=()=>{
      const card=el('article',null,'award-detail');
      const title=el('h2',a.title);title.id='detail-title';
      const big=el('img');big.src=a.image;big.alt=`${t('Certificate')}${colon()} ${a.place}, ${a.title}`;
      card.append(el('p',a.place,'kicker'),title,el('p',`${a.event} · ${a.date}`,'award-meta'),big);
      openDetail(card,b);
    };
    return b;
  }));
}
// Journey steps are built once (the 3D scene keeps the buttons) and relabelled in place.
const journeyList=document.querySelector('.journey-steps');
const journeyButtons=journey.map((step,i)=>{
  const li=el('li');const b=el('button',null,'journey-step');b.type='button';
  b.append(el('span',null,'journey-year'),el('span',null,'journey-name'));
  const more=el('div',null,'journey-more');more.append(el('p'),el('p'));
  b.onclick=()=>document.dispatchEvent(new CustomEvent('studio:journey',{detail:{index:i}}));
  li.append(b,more);journeyList?.append(li);return b;
});
function labelJourney(){
  journeyButtons.forEach((b,i)=>{
    const step=journey[i],[year,name]=b.children,[when,what]=b.nextElementSibling.children;
    year.textContent=step.years.split(' – ')[0];name.textContent=step.title;
    when.textContent=`${step.years} · ${step.org}`;what.textContent=step.text;
  });
}
renderSkills();renderResearch();renderAwards();labelJourney();
onLang(()=>{
  applyLanguage();
  pins.forEach((b,i)=>{b.textContent=projects[i].name;});
  renderSkills();renderResearch();renderAwards();labelJourney();
  document.dispatchEvent(new CustomEvent('studio:relabel'));
});
dialog.querySelector('.close').onclick=()=>dialog.close();
dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}};
dialog.addEventListener('close',()=>{inside.querySelector('video')?.pause();inside.replaceChildren();opener?.classList.remove('pulled');opener?.focus({preventScroll:true});});
// Drive the shared backdrop independently of WebGL, including on restored scroll positions.
const root=document.documentElement;
let themeFrame=0,lastGlass='',lastBg='';
// These variables live on <html>, so every write restyles the whole page: write only on change.
// The background only spans ~7 shades (#131210 → #1a1815), so 0.5 % steps are invisible.
function paintBackdrop(){
  themeFrame=0;
  const exit=(document.querySelector('#glass').offsetTop-scrollY)/Math.max(1,innerHeight);
  const panel=Math.max(0,Math.min(1,exit));
  const glass=(panel*panel*(3-2*panel)).toFixed(3);
  if(glass!==lastGlass){root.style.setProperty('--opening-glass-opacity',glass);lastGlass=glass;}
  document.body.classList.toggle('at-opening',exit>.04);
  const travel=Math.max(1,root.scrollHeight-root.clientHeight);
  const progress=Math.max(0,Math.min(1,scrollY/travel));
  const eased=progress*progress*(3-2*progress);
  const bg=`color-mix(in oklab, #131210, #1a1815 ${(Math.round(eased*200)/2).toFixed(1)}%)`;
  if(bg!==lastBg){root.style.setProperty('--page-bg',bg);lastBg=bg;}
}
function scheduleBackdrop(){if(!themeFrame)themeFrame=requestAnimationFrame(paintBackdrop);}
window.addEventListener('scroll',scheduleBackdrop,{passive:true});
window.addEventListener('pageshow',scheduleBackdrop);
new ResizeObserver(scheduleBackdrop).observe(document.body);
paintBackdrop();
document.querySelector('.scroll-arrow').addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The first arrow plays the guided glide through the glass scene.
  if(reduced)document.querySelector('#glass').scrollIntoView({behavior:'instant'});
  else document.dispatchEvent(new CustomEvent('studio:glide'));
});
// A next-page arrow on every page after the first (the last page has none).
{
  const pages=['#home','#glass','#about','#bench','#skills','#research','#journey','#contact'].map(s=>document.querySelector(s)).filter(Boolean);
  const arrow=document.createElement('a');
  arrow.className='page-arrow';arrow.href='#';arrow.setAttribute('aria-label',t('Scroll to the next page'));
  onLang(()=>arrow.setAttribute('aria-label',t('Scroll to the next page')));
  arrow.innerHTML='<span aria-hidden="true">↓</span>';
  document.body.append(arrow);
  const next=()=>pages.find(p=>p.offsetTop>scrollY+8);
  let frame=0;
  const update=()=>{frame=0;
    const n=next(),home=pages[0],last=pages[pages.length-1];
    const show=scrollY>home.offsetTop+home.offsetHeight-innerHeight*1.1&&n&&last.getBoundingClientRect().top>innerHeight*.85;
    arrow.classList.toggle('on',Boolean(show));
    arrow.dataset.page=(pages.filter(p=>p.offsetTop<=scrollY+8).pop()||home).id;
  };
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
  addEventListener('resize',update);update();
  arrow.addEventListener('click',e=>{
    e.preventDefault();const n=next();if(!n)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({top:n.offsetTop,behavior:reduced?'instant':'smooth'});
  });
}

// The CAD scenes own these spots; the drawing and text stand-ins appear only if 3D fails.
document.documentElement.classList.add('studio-3d');
import('./scene.js').then(m=>m.startStudio(pins,{journey,journeyButtons})).catch(error=>{
  reveal();
  document.body.classList.add('arm-failed','writer-failed');
  console.warn('3D preview unavailable',error);
});
