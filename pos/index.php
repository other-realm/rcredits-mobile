<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
$results= var_dump($_POST);
print_r($results);
//if (!$matches) die('nope');
//exit('yes');
?>












































//$text = <<<EOF
///**
// * security code is (ARG)
// *
// * in: TEST ParseQRCode WeScanAValidPersonalCard
// *     TEST ParseQRCode WeScanAValidCompanyCard
// */
//this.securityCodeIs = function(\$arg1) {
//
//
///**
// * relations: (ARG)
// *
// * in: 
// */
//function relations(\$relations)
//
//EOF;
//
//  $pattern = ''
//  . '^/\\*\\*$\\s'
//  . '^ \\* ([^\*]*?)$\\s'
//  . '^ \\*$\\s'
//  . '^ \\* in: ((.*?)$\\s'
//  . '^ \\*/$\\s'
//  . '^function (.*?)\()';  
//  
//  $pattern = ''
//  . '^/\\*\\*\\s?$\\s^'
//;  // yes
//
//  $pattern = ''
//  . '^/\\*\\*\\s?$\\s'
//  . '^ \\* ([^\*]*?)\\s?$\\s'
//  . '^ \\*\\s?$\\s'
//  . '^ \\* in: ((.*?)\\s?$\\s'
//  . '^ \\*/\\s?$\\s'
//  . '^this\.(.*?) )';  
//  
//preg_match_all("~$pattern~ms", $text, $matches, PREG_SET_ORDER);
//if (!$matches) die('nope');
//exit('yes');