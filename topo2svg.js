#!/usr/bin/env node

var d3 = require('d3'),
    topojson = require('topojson');

var fs = require("fs"),
    optimist = require("optimist");


var argv = optimist
        .usage("Usage: \033[1mttopo2svg\033[0m [options] [file]\n\n"+
        "Converts the specified input TopoJSON to SVG")

    .options("o", {
        alias: "out",
        describe: "output SVG file name",
        default: "/dev/stdout"
    })
    .options("w", {
        alias: "width",
        describe: "output width",
        default: 600
    })
    .options("h", {
        alias: "height",
        describe: "output height",
        default: 'auto'
    })
    .options("p", {
        alias: "properties",
        describe: "feature properties to preserve; no name preserves all properties",
        default: false
    })
    .options("help", {
        describe: "display this helpful message",
        type: "boolean",
        default: false
    })
    .check(function(argv) {
        if (!argv._.length) throw new Error("input required");
    })
    .argv;

if (argv.help) return optimist.showHelp();


var file = argv._[0],
    width = argv.w,
    height = argv.h;

var topology = JSON.parse(fs.readFileSync(file, "utf-8"));

// find min-max lat lon in geometry
var projection = d3.geo.equirectangular(),
    path = d3.geo.path().projection(projection);

var obj = topojson.object(topology, topology.objects.DE),
    bounds = path.bounds(obj),
    centroid = path.centroid(obj);

bounds = [projection.invert(bounds[0]), projection.invert(bounds[1])];
centroid = projection.invert(centroid);

projection = d3.geo.azimuthalEqualArea()
    .scale(1)
    .rotate([-centroid[0], -centroid[1]])
    .precision(0.1);

bounds = [projection(bounds[0]), projection(bounds[1])];

var scale;

if (width == 'auto' && height == 'auto') width = '600';
if (width == 'auto') {
    scale = height / (bounds[1][1] - bounds[0][1]);
    width = scale * (bounds[1][0] - bounds[0][0]);
} else {
    scale = width / (bounds[1][0] - bounds[0][0]);
    height = scale * (bounds[1][1] - bounds[0][1]);
}

projection
    .scale(scale*(1 - 10/width))
    .translate([width / 2, height / 2]);

path = d3.geo.path()
    .projection(projection);


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("version", "1.1")
    .attr("viewBox", "0 0 "+width+" "+height)
    .attr("style", "stroke-linejoin: round; stroke:#000; fill: #eee;")
    .attr("xmlns", "http://www.w3.org/2000/svg");

svg.selectAll("path")
    .data(topojson.object(topology, topology.objects.DE).geometries)
  .enter().append("path")
    .attr("d", function(d) { return path(d).replace(/(\d+\.\d)\d+/g, "$1" ); });

// Get a standard conform SVG string:
var svgdoc = "<?xml version=\"1.0\" ?><!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>"+
    d3.select("body").html();

// Make d3.geo.path.
if (argv.o === "/dev/stdout") console.log(svgdoc);
else fs.writeFileSync(argv.o, svgdoc, "utf8");
