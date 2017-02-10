<?php

	if(isset($_POST['folderName']) && !empty($_POST['folderName'])){

		$folder_name = 	$_POST['folderName'];
		
	    chdir('..');
		$cwd_dir = getcwd();
		$targt_path = $cwd_dir.'/docs/'.$folder_name;
                
		$meassage = array();
		if (!is_dir($targt_path)){
			
			mkdir($targt_path, 0755, true);
			
		}
		
		$meassage['success'] = true; 
		$meassage['message'] = "Your folder has been created succesfully."; 
		echo json_encode($meassage);
		exit;
		// function createPath($path) {
			
			// if (is_dir($path)) return true;
			// $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
			// $return = createPath($prev_path);
			// return ($return && is_writable($prev_path)) ? mkdir($path) : false;
		// }
		
	}
?>