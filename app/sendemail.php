<?php

	if(isset($_POST) && !empty($_POST)){
		$to      = $_POST['emailto'];
		$from      = $_POST['emailfrom'];
		$subject = $_POST['subject'];
		$message = $_POST['emailBody'];
		$countryId = $_POST['countryId'];
		$headers = 'From: litesupport@ivizard.org' . "\r\n" .'Reply-To: litesupport@ivizard.org' . "\r\n" .'X-Mailer: PHP/' . phpversion();
		
		if(mail($to, $subject, $message, $headers)){
			$servername = "localhost";
			$username = "ivizard_lite";
			$password = "V+tZqq-]S2NB";
			$dbname = "ivizard_lite";

			// Create connection
			$conn = mysqli_connect($servername, $username, $password, $dbname);
			// Check connection
			if (!$conn) {
				die("Connection failed: " . mysqli_connect_error());
			}

			//$sql = "INSERT INTO email_sender_status (sender,receiver,subject,message,createdon,countryid)
			//VALUES ('$from', '$to','$subject','$message',".time().",$_POST['countryId'])";
			 $sql = "INSERT INTO email_sender_status (sender,receiver,subject,message,createdon,countryid)
   VALUES ('$from', '$to','$subject','$message',".time().",$countryId)";

			if (mysqli_query($conn, $sql)) {
				$status['status'] = true;
				$status['message'] = "Email was sent successfully.";
				mysqli_close($conn);
				echo json_encode($status);
				exit;
			} else {
				echo "Error: " . $sql . "<br>" . mysqli_error($conn);
			}
			

		}else{
			
			$status['status'] = false;
			$status['message'] = "Errror has occured.";
			echo json_encode($status);
			exit;
			
		}
	}
?>