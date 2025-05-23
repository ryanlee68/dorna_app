// hide and show script
$(".jog_display_b").on("click", function (e){
	e.preventDefault()
	$(".jog_display_panel").toggle();

	
	$(".joint_info_secondry" ).each(function( index){
		$(this).toggle()
	})
	
	// 3d graphic
	onWindowResize()
});	

$( ".bind" ).on("input", function(e) {
  let key = $(this).attr("data-key");
  let bind = $(this).attr("data-bind");
  let val = $(this).prop("value");
  let data_value = $(this).attr("data-value");

  $(`${bind}[data-key=${key}][data-value=${data_value}]`).prop("value", val);
});


$(".halt_b").on("click", function(e) {
  e.preventDefault();
	let msg = {
		"cmd":  $(this).attr("data-cmd"),
		"accel": 2
	}
	send_message(msg)
});

$('.motor_c').on( 'click', function( e ) {
	e.preventDefault()
	let msg = {
		"cmd":  $(this).attr("data-cmd"),
	}
	msg[$(this).attr("data-key")] = $(this).prop("checked")? 1:0
	send_message(msg)
})

$(".set_joint_b").on("click", function(e) {
	e.preventDefault();
	
	let msg = {
	  "cmd": $(this).attr("data-cmd"),
	}

	// check for all
	if($(this).hasClass("all")){
		$(".set_joint_v" ).each(function( index){
			if(parseInt($(this).attr("index"))<5||ND[parseInt($(this).attr("index"))])
				msg[$(this).attr("data-key")] = Number($(this).prop("value"))
		})
	}else{
		let key = $(this).attr("data-key")
		msg[key] = Number($(`.set_joint_v[data-key=${key}]`).prop("value"))		
	}
	
	send_message(msg)
	
});

$( ".go_b" ).on("click", function(e) {
	e.preventDefault();

	let msg = {
		"cmd": $(this).attr("data-cmd"),
	}
	msg["rel"] = $(`.jog_r_c[data-type=${$(this).attr("data-type")}]`).prop("checked") ? 1 : 0
	

	// joints
	$(`.go_v[data-type=${$(this).attr("data-type")}]`).each(function() {
		let i = axis_names_to_numbers[$(this).attr("data-key")];
		if(i<5||ND[i])
			msg[$(this).attr("data-key")] = Number($(this).prop("value"))
	});
 
	// vel, accel, jerk
	$(`.vaj_s_v[data-value=${$(this).attr("data-type")}]`).each(function() {
		msg[$(this).attr("data-key")] = Number($(this).prop("value"))
	});

	send_message(msg)
});

/*
Event handler for the jog buttons
Obtains the key and value of the jog
Calls the send_simple_move_cmd function
*/
/*
 j0, j1, ... j4
 x, y, z, a, b
 direction : -1, 1
*/
$(".jog_b").on("mousedown touchstart", function(e) {
	e.preventDefault();

	
	console.log( $(this).attr("data-cmd") , $(this).attr("data-key") , $(this).attr("data-value"))
	let msg = {	"cmd": $(this).attr("data-cmd"),
				"rel":0};

	let s = $(this).attr("data-key");
	if($(this).attr("data-value")>0) s = "p" + s;
	else s = "n" + s; 

	let info;


	if($(this).attr("data-cmd")==="lmove"){
		info = original_robot.allowed_xyza();
		if(info["na"]<-9000||info["pa"]>9000){
			if(s=="a")
				msg["rel"] = 1;
			info["pa"] = 180;
			info["na"] = -180;
		}
	}
	if($(this).attr("data-cmd")==="jmove"){
		info = original_robot.allowed_j();
	}

	let limit = info[s]

	if($(this).attr("data-cmd")==="jmove"){
		limit = limit - 2 * Math.sign(info[s]);
	}
	if($(this).attr("data-cmd")==="lmove"){
		limit = limit;
	}

	let current_value = original_robot.value($(this).attr("data-key"));
	
	let l = limit - current_value;//length that is going to be joged

	if($(this).attr("data-cmd")==="lmove"){
		let d = 0;//5.0;test
		console.log("l",l,"d",d)
		if(Math.abs(l)>d)
			l = l - Math.sign(l)*d;
	}
	if($(`.jog_d_c[data-cmd=${msg["cmd"]}]`).prop("checked")){//descrete jog
			l = Math.sign( l ) *  Math.abs( $(`.jog_d_v[data-cmd=${msg["cmd"]}]`).prop("value") ) ;
	}
	
	limit = Number((current_value + l).toFixed(to_fixed_val+2));
	msg[$(this).attr("data-key")] = limit;
	
	/*Begin test*/if($(this).attr("data-cmd")==="lmove"){
		let vv = new THREE.Vector3(0,0,0)
		vv = original_robot.position;
		vv[$(this).attr("data-key")]  = limit/1000;
		console.log("checking: pos:",vv , "abc: ",original_robot.abc)
		ret = [0,0,0,0,0,0,0]
		original_robot.IK(vv,original_robot.abc,ret);
	}/*End test*/

	// vel, accel, jerk
	$(`.vaj_s_v[data-value=${$(this).attr("data-type")}]`).each(function() {
		msg[$(this).attr("data-key")] = Number($(this).prop("value"))
	});
	
	// get necessary attributes
	console.log("msg",msg)
	send_message(msg)
	if(!$(`.jog_d_c[data-cmd=${msg["cmd"]}]`).prop("checked")){
		$(document).on("mouseup touchend", function(e) {
			$(document).unbind("touchend");
			$(document).unbind("mouseup");
			$(".halt_b").click()
		});
	}
});


/*
Event handler for the current position buttons
if in absolute mode
the input field is updated to be equal to the value of the current position of each j
*/
$(".current_p_b").on("click", function(e) {
	e.preventDefault()

	let type = $(this).attr("data-item")
	let pos = Object.values(position(type)) 

	// set
	$(`.go_v[data-item=${type}]`).each(function(index) {		
		$(this).prop("value", pos[index])
	});
});

$(".rec_p_b").on("click", function(e) {
	e.preventDefault()
	let cmd = {"cmd": $(this).attr("data-cmd"), "rel":0};
	
	let comp_pos = position($(this).attr("data-item"));
	let i=0;
	for(i=0;i<5+ND_count ;i++){
		if(i<5||ND[i]){
			name1 = "j" + i;
			name2 = xyz_names[i];
			if(!(typeof comp_pos[name1]==='undefined'))
				cmd[name1] = comp_pos[name1];
			if(!(typeof comp_pos[name2]==='undefined'))
				cmd[name2] = comp_pos[name2];
		}
	}
	// add to the last line of the script
	add_to_editor(cmd)
});

function position(type = "joint"){
	/*
	let pos = {}
	$("."+type+"_v").each(function(index, element) {
		pos[$(this).attr("data-key")] = Number($(this).text());
	});*/

	if(type=="joint")
		return {"j0":position_value["j0"],
				"j1":position_value["j1"],
				"j2":position_value["j2"],
				"j3":position_value["j3"],
				"j4":position_value["j4"],
				"j5":position_value["j5"],
				"j6":position_value["j6"],
				"j6":position_value["j6"],
				"j7":position_value["j7"]};

	if(type=="xyz")
		return {"x":position_value["x"],
				"y":position_value["y"],
				"z":position_value["z"],
				"a":position_value["a"],
				"b":position_value["b"],
				"c":position_value["c"],
				"d":position_value["d"],
				"e":position_value["e"]};
}





/*
$(".joint_v[data-key=j0]").text("161.016");
$(".joint_v[data-key=j1]").text("180");
$(".joint_v[data-key=j2]").text("-142");
$(".joint_v[data-key=j3]").text("135");
*/