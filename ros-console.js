// Page 1 backdrop: a live ROS 2 terminal from a VeggieBot launch, streaming faintly
// behind the name and the bionic arm. New log lines arrive every second or so and the
// log scrolls up like a real console. It only runs while page 1 is on screen; with
// reduced motion the console is drawn once and stays still.
const frame=document.querySelector('.opening-glass');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const NODES=[
  ['robot_state_publisher','got segment base_link'],
  ['controller_manager','Loading controller \'scaled_joint_trajectory_controller\''],
  ['ur_robot_driver','Robot connected to reverse interface'],
  ['ur_robot_driver','Robot mode is now RUNNING'],
  ['realsense2_camera_node','Device with serial number found, starting streams'],
  ['realsense2_camera_node','RealSense Node Is Up!'],
  ['quest_teleop','Hand tracking started'],
  ['robotiq_gripper','Robotiq 2F-85 activated'],
  ['joint_state_broadcaster','publishing /joint_states'],
  ['policy_runner','Loaded checkpoint, waiting for observation'],
  ['data_recorder','Recording episode to /data/veggiebot'],
  ['data_recorder','Episode saved'],
  ['moveit.move_group','Planning request received'],
  ['moveit.move_group','Plan and Execute request complete!'],
  ['micro_ros_agent','Client connected (ESP32)'],
  ['balance_controller','PID loop running on Arduino Nano'],
  ['emg_reader','Channel 1 calibrated'],
  ['camera_top','Frame synchronised with camera_front'],
  ['tf2_buffer','Transform base_link → tool0 available'],
  ['jetson_bridge','GPU inference ready']
];
const WARN=[['camera_wrist','frame dropped, re-syncing'],['ur_robot_driver','Speed scaling reduced to 80%']];
let clock=Math.floor(Date.now()/1000)-180;
function line(){
  clock+=Math.random()*1.8+.1;
  const warn=Math.random()<.07,[node,msg]=warn?WARN[Math.floor(Math.random()*WARN.length)]:NODES[Math.floor(Math.random()*NODES.length)];
  const el=document.createElement('div');
  el.className='ros-line'+(warn?' warn':Math.random()<.1?' hot':'');
  const ns=String(Math.floor(Math.random()*1e9)).padStart(9,'0');
  el.textContent=`[${warn?'WARN':'INFO'}] [${clock.toFixed(0)}.${ns}] [${node}]: ${msg}`;
  return el;
}
if(frame){
  const con=document.createElement('div');con.className='ros-console';con.setAttribute('aria-hidden','true');
  con.innerHTML='<div class="ros-log"></div>';
  frame.append(con);
  const log=con.querySelector('.ros-log');
  const lineH=()=>parseFloat(getComputedStyle(log).lineHeight)||22;
  function fill(){
    const want=Math.ceil(log.clientHeight/lineH())+2;
    while(log.children.length<want)log.append(line());
    while(log.children.length>want+1)log.firstElementChild.remove();
  }
  fill();
  let timer=0,busy=false;
  const visible=()=>!document.hidden&&scrollY<innerHeight*1.6;
  function tick(){
    timer=setTimeout(tick,700+Math.random()*1100);
    if(busy||!visible()||reduced.matches)return;
    busy=true;
    log.append(line());
    log.style.transition='transform .35s ease';
    log.style.transform=`translateY(${-lineH()}px)`;
    setTimeout(()=>{log.style.transition='none';log.style.transform='';log.firstElementChild?.remove();fill();busy=false;},380);
  }
  timer=setTimeout(tick,900);
  addEventListener('resize',fill);
}
