// dimensions
var width = document.body.clientWidth;
var height = document.body.clientHeight;

var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
}

// create an svg to draw in
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('transform', 'translate(' + margin.top + ',' + margin.left + ')');

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var simulation = d3.forceSimulation()
    // pull nodes together based on the links between them
    .force("link", d3.forceLink().id(function(d) {
        return d.id;
    })
    .strength(0.025))
    // push nodes apart to space them out
    .force("charge", d3.forceManyBody().strength(-200))
    // add some collision detection so they don't overlap
    .force("collide", d3.forceCollide().radius(12))
    // and draw them around the centre of the space
    .force("center", d3.forceCenter(width / 2, height / 2));

// load the graph
d3.json("data.json", function(error, graph) {
    console.debug(graph);
    // set the nodes
    var nodes = graph.nodes;
    // links between nodes
    var links = graph.links;

    console.debug(svg);
    
    // add the curved links to our graphic
    var link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr('stroke', function(d){
            return "#ddd";
        });

    // add the nodes to the graphic
    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")

    // a circle to represent the node
    node.append("circle")
        .attr("class", "node")
        .attr("r", 8)
        .attr("fill", function(d) {
            return d.colour;
        })
        .on("mouseover", mouseOver(0))
        .on("mouseout", mouseOut);

    // hover text for the node
    node.append("title")
        .text(function(d) {
            return d.name;
        });

    // add a label to each node
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .html(function(d) {
            return d.name;
        })
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .style("fill", function(d) {
            return d.colour;
        });

    // add the nodes to the simulation and
    // tell it what to do on each tick
    simulation
        .nodes(nodes)
        .on("tick", ticked);

    // add the links to the simulation
    simulation
        .force("link")
        .links(links);

    // on each tick, update node and link positions
    function ticked() {
        link.attr("d", positionLink);
        node.attr("transform", positionNode);
    }

    // links are drawn as curved paths between nodes,
    // through the intermediate nodes
    function positionLink(d) {
        var offset = 30;

        var midpoint_x = (d.source.x + d.target.x) / 2;
        var midpoint_y = (d.source.y + d.target.y) / 2;

        var dx = (d.target.x - d.source.x);
        var dy = (d.target.y - d.source.y);

        var normalise = Math.sqrt((dx * dx) + (dy * dy));

        var offSetX = midpoint_x + offset*(dy/normalise);
        var offSetY = midpoint_y - offset*(dx/normalise);

        return "M" + d.source.x + "," + d.source.y +
            "S" + offSetX + "," + offSetY +
            " " + d.target.x + "," + d.target.y;
    }

    // move the node based on forces calculations
    function positionNode(d) {
        // keep the node within the boundaries of the svg
        if (d.x < 0) {
            d.x = 0
        };
        if (d.y < 0) {
            d.y = 0
        };
        if (d.x > width) {
            d.x = width
        };
        if (d.y > height) {
            d.y = height
        };
        return "translate(" + d.x + "," + d.y + ")";
    }

    // build a dictionary of nodes that are linked
    var linkedByIndex = {};
    links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    // check the dictionary to see if nodes are linked
    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    function isNode(a,b)
    {
        return a.index == b.index;
    }

    // fade nodes on hover
    function mouseOver(opacity) {
        return function(d) {
            // check all other nodes to see if they're connected
            // to this one. if so, keep the opacity at 1
            node.style("stroke-opacity", function(o) {
                let thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            });
            node.style("fill-opacity", function(o) {
                let thisOpacity = isConnected(d, o) ? 1 : opacity;
                return thisOpacity;
            });
            // also style link accordingly
            link.style("stroke-opacity", function(o) {
                return isConnected(d, o) ? 1 : opacity;
            });
            link.style("stroke", function(o){
                return isConnected(d, o) ?  o.source.colour : "#ddd";
            });

            link.style("fill-opacity", function(o){
                let thisOpacity = (o.source === d || o.target === d) ? 0.5 : opacity;
                return thisOpacity;
            });
        };
    }

    function mouseOut() {
        node.style("stroke-opacity", 1);
        node.style("fill-opacity", 1);
        link.style("stroke-opacity", 1);
        link.style("fill-opacity", 0.5);
        link.style("stroke", "#ddd");
    }

});