/**
 * d3js力导向图
 *  - 实现的功能
 *      - 添加节点
 *      - 移除节点
 */
function displaySVGinContainer() {
    const savedSVGString = localStorage.getItem('savedSVG');
    if (savedSVGString) {
        const container = document.getElementById("map");
        const existingImage = document.getElementById("mapImage");
        if (existingImage) existingImage.remove();

        const div = document.createElement("div");
        div.innerHTML = savedSVGString;
        container.appendChild(div.firstChild);
    }
}

class App {
    INODES = 'involved_nodes';
    UNODES = 'uninvolved_nodes';

     constructor(svgsel, nodes, links, dataHandler) {
         // 创建初始节点数据
        this.nodes = nodes

        // 创建初始连接线数据
        this.links = links;

        this.dataHandler = dataHandler;

        this.width = svgsel.node().clientWidth;
        this.height = svgsel.node().clientHeight;

        // 创建SVG容器
        this.svg = svgsel.append('g')
            //.attr('transform', `translate(${[this.width/2, this.height/2]})`);
        this.linkGroup = this.svg.append('g')
        this.nodeGroup = this.svg.append('g')

        this.init()
        // this.startAnimation();
    }

    init() {
        // 创建连接线
        /*
        this.link = this.linkGroup
            .selectAll(".link")
            .data(this.links)
            .enter()
            .append("line")
            .attr("stroke", "red")
        */

        // 创建节点
        this.node = this.nodeGroup
            .selectAll(".node")
            .data(this.nodes)
            .enter()
            .append("g")
            .attr('stroke', node => node.type === this.INODES ? '#1d9bf0' : '#D0D0D0')
            .attr('fill', node => node.type === this.INODES ? '#1d9bf0' : 'white')
       
        this.node.append('circle')
            .attr('r', node => node.r);
        
        // this.node.append('text').text(d=>d.name)
    }

    startAnimation()
    {
        this.simulation = d3.forceSimulation(this.nodes);
        console.log(this.simulation.alpha(), this.simulation.alphaMin())

            // this.simulation.alpha(.2);
            // .alphaMin(.1)
            // .alpha(.1)

            this.simulation
            .force("link", d3.forceLink(this.links).id(d => d.id).distance(dataHandler.MAX_RADIUS).strength(1))
            
            .force("charge", d3.forceManyBody().strength(- this.dataHandler.MAX_RADIUS * this.dataHandler.MAX_RADIUS))
            
            .force('collision', d3.forceCollide().radius(node => node.r))

            .force("radial", d3.forceRadial().radius(1).x(this.width/2).y(this.height/2).strength(1))

            // .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(1))

            .on("tick", this.ticked())
            .on("end", ()=>{
                console.log('===========over')
                this.ticked();
                saveSVGtoLocalStorage();
            })
    }

    ticked() {
        const t_start = new Date()
        const render_seconds = 1;
        let lastTime = t_start;

        // console.log(this.simulation.alpha())
        return ()=>{
            const t_now = new Date();
            const duration  = t_now - lastTime;

            if( duration <= render_seconds * 1000){
                return
            }

            console.log(`render at ${Math.floor((t_now - t_start) / 1000)}s, alpha:${this.simulation.alpha()}`)

            lastTime = t_now;
            
            this.node
            .attr('transform', d=>`translate(${[d.x, d.y]})`)

            /*
            this.link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });
            */

        }
    }
}

