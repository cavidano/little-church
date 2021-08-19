<?php

/*
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */

return array(
    '*' => array(

        // Default Week Start Day (0 = Sunday, 1 = Monday...)
		'defaultWeekStartDay' => 0,

		// Enable CSRF Protection (recommended, will be enabled by default in Craft 3)
		'enableCsrfProtection' => true,

		// Whether "index.php" should be visible in URLs (true, false, "auto")
		'omitScriptNameInUrls' => 'true',

		// Control Panel trigger word
		'cpTrigger' => 'grace',
    ),

    'lc-craft' => array(
        'devMode' => true,

        'environmentVariables' => array(
            'baseUrl' => 'http://lc-craft/',
        )
    ),

    'lc.avidanodigital.com' => array(
        'devMode' => false,
        
        'environmentVariables' => array(
            'baseUrl'  => 'https://lc.avidanodigital.com/',
        )
    ),
    
    'www.littlechurch.org' => array(
        'devMode' => false,
        
        'environmentVariables' => array(
            'baseUrl'  => 'http://www.littlechurch.org/',
        )
    )
);