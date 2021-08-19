<?php 

    if (!empty($_POST)){
        // collect vars 
        $EmailTo = "carl@avidanodigital.com";
        $Subject = "Little Church Newsletter Sign Up";
        $Email = Trim(stripslashes($_POST['email'])); 

        // prepare body 
        $Body = "";
        $Body .= "Email: ";
        $Body .= $Email;

        // send email 
        $success = mail($EmailTo, $Subject, $Body, "From: <$Email>");
    }
?>
