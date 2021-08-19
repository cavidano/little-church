<?php

/**
 * Database Configuration
 *
 * All of your system's database configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/db.php
 */

// return array(

// 	// The database server name or IP address. Usually this is 'localhost' or '127.0.0.1'.
// 	'server' => 'localhost',

// 	// The name of the database to select.
// 	'database' => 'little_church',

// 	// The database username to connect with.
// 	'user' => 'root',

// 	// The database password to connect with.
// 	'password' => 'root',

// 	// The prefix to use when naming tables. This can be no more than 5 characters.
// 	'tablePrefix' => 'craft',

// );

return array(
    '*' => array(
        'tablePrefix' => 'craft',
    ),

    'little-church-2021' => array(
        'server' => 'localhost',
        'database' => 'little_church_atc',
        'user' => 'root',
        'password' => 'root',
        'initSQLs' => array("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';")
    ),
    
    'littlechurch.org' => array(
        'server' => 'localhost',
        'database' => 'transfig_craft',
        'user' => 'transfig_craft',
        'password' => 'vz864nr2mO0NMQV2cg',
    )
);