#!/usr/bin/perl

my @files = glob ("*.ts");

foreach my $file (@files) {
    print "ts_size[\"$file\"]=", -s $file,";\n";
}
