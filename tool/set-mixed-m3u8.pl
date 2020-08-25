#!/usr/bin/perl
open (IN, "-") or die "$!";

$url1=$ARGV[0];
$url2=$ARGV[1];
$count = 0;

while ($line = <IN>) {
    $line =~ s/\x0D?\x0A?$//;
    if ($line !~ /^#/) {
        if (($count % 2) == 0) {
            print $url1.$line."\n";
        } else {
            print $url2.$line."\n";
        }
        $count++;
    } else {
        print $line."\n";
    }
}
