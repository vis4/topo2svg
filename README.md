# topo2svg

A simple script that renders SVG from TopoJSON. Build with [d3](http://d3js.org) and [topojson](https://github.com/mbostock/topojson).

Usage:

    node topo2svg.js -o germany.svg germany.json


This is an early prototype. API may change, features may be added.

## Todo

* make proper node package
* include properties in SVG as data attributes
* allow change of projections
* keep projection information in SVG metadata section
