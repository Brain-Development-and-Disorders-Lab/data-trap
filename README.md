# Data Trap

A small CLI utility to monitor a data directory and copy any files to a specified destination. This tool can be used to bridge the gap between experiment data and local data storage such as external drives or mounted network volumes.

## Usage

`datatrap -s <source> -d <destinations>`

### Source

- `-s, --source`: The directory of the files that are to be transferred. This is optional, and if it is not specified, the tool will work with files from the current directory.

- `-d, --destinations`: The destinations of the transferred files. One or more destination can be specified, and each destination should exist, otherwise the utility will exit. This option is required.
