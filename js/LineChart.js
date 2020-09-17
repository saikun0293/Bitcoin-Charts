LineChart=function(_parentElement,_coin){
    this.parentElement=_parentElement;
    this.coin=_coin;
    this.initVis();
};

//Initialisation our visualisation including the variables which remain static throughout the process
LineChart.prototype.initVis=function(){
    let vis=this;

    vis.margin = { left:60, right:30, top:10, bottom:100 };
    vis.height = 400 - vis.margin.top - vis.margin.bottom;
    vis.width = 600 - vis.margin.left - vis.margin.right;

    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" +vis.margin.left + 
            ", " + vis.margin.top + ")");

    vis.t=function(){d3.transition().duration(1000);}

    // For tooltip
    vis.bisectDate = d3.bisector(function(d) { return d.date; }).left;

    vis.linePath=vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-with", "3px");

    // Scales
    vis.x = d3.scaleTime()
                .range([0, vis.width]);
    vis.y = d3.scaleLinear()
                .range([vis.height, 0]);


    // Axis generators
    vis.xAxisCall = d3.axisBottom()
        .ticks(4);
    vis.yAxisCall = d3.axisLeft()
        .ticks(6);

    // Axis groups
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis")

    // X-axis label
    vis.xLabel=vis.g.append("text")
        .attr('x',vis.width/2)
        .attr('y',vis.height+60)
        .attr('text-anchor','middle')
        .attr('font-size','20px')
        .text('Time');

        
    vis.title=vis.g.append("text")
    .attr('x',vis.width/2)
    .attr('y',20)
    .attr('font-size','2rem')
    .attr('text-anchor','middle');

    vis.wrangleData();
};


LineChart.prototype.wrangleData=function(){
    let vis=this;
    vis.measure=$("#var-select").val();
    
    vis.extractData=function(){
        return modifiedData[vis.coin].filter(function(d){
            return d[vis.measure]!==null;
        })
    }

    vis.reqData=vis.extractData();

    vis.updateVis();
};

LineChart.prototype.updateVis=function(){
    let vis=this;

    vis.title.text($("[value="+vis.coin+"]").text());

    let [start,end]=$("#date-slider").slider("values");

    vis.filteredData=vis.reqData.filter(function(d){
        return (d.date>=start) && (d.date<=end);
    })
    // console.log(vis.filteredData);//*******CONSOLE LOGGING HERE******/

    // Set scale domains

    //----Updating Scales----------------
    vis.x.domain(d3.extent(vis.filteredData,function(d){return d.date;}));
    vis.y.domain([0, d3.max(vis.filteredData, function(d) { return d[vis.measure]; })*1.005]);//Adding buffer at top

    //----Fix for format values----------
    vis.formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
      let s = vis.formatSi(x);
      switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
      }
      return s;
    }

    //----Updating Axes------------------
    vis.xAxisCall.scale(vis.x);
    vis.yAxisCall
        .scale(vis.y)
        .tickFormat(formatAbbreviation);
   
    vis.xAxis
        .transition(vis.t)
        .call(vis.xAxisCall);
    vis.yAxis
        .transition(vis.t)
        .call(vis.yAxisCall);

    // //----Clearing old tool tips---------
    // d3.select(".focus").remove();
    // d3.select(".overlay").remove();
    
    //---Updating Tool tip----------------

    var focus =vis.g.append("g")
        .attr("class", "focus"+vis.coin)
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", vis.height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", vis.width);

    focus.append("circle")
        .attr("r", 3);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    vis.svg.append("rect")
        .attr("transform","translate("+vis.margin.left+","+vis.margin.top+")")
        .attr("class", "overlay "+vis.coin)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(vis.filteredData, x0, 1),
            d0 = vis.filteredData[i - 1],
            d1 = vis.filteredData[i],
            d = (d1&&d0)? (x0 - d0.date > d1.date - x0 ? d1 : d0):0;

        focus.attr("transform", "translate(" + vis.x(d.date) + "," + vis.y(d[vis.measure]) + ")");
        focus.select("text").text('$'+formatAbbreviation(d[vis.measure]));
        focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d[vis.measure]));
        focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
    }

    // Line path generator
     var line = d3.line()
     .x(function(d) { return vis.x(d.date); })
     .y(function(d) { return vis.y(d[vis.measure]); });


    //---Updating Line Chart-------------
    vis.linePath
        .transition(vis.t)
        .attr("d",line(vis.filteredData)); 

}
//Syntax for making a function
//LineChart.prototype.methodName