/**
 * 打乱数组、从而获取元素的样本
 * @param {*} arr 
 * @returns 
 */
function sample_arr(arr){
    arr = arr.sort(()=> Math.random() - 0.5);
    return arr;
}



EXAMPLE = {
    nodes: [
        { id: 0, name: "节点1" , type: 0, r: 10},
        { id: 1, name: "节点2" , type: 0, r: 10},
        { id: 2, name: "节点3" , type: 0, r: 10},
        { id: 3, name: "节点4" , type: 0, r: 10},

        { id: 10, name: "节点11" , type: 1, r: 10},
        { id: 11, name: "节点12" , type: 1, r: 10},
        { id: 12, name: "节点13" , type: 1, r: 10},
        { id: 13, name: "节点14" , type: 1, r: 10},

        { id: 20, name: "节点11" , type: 2, r: 10},
        { id: 21, name: "节点12" , type: 2, r: 10},
        { id: 22, name: "节点13" , type: 2, r: 10},
        { id: 23, name: "节点14" , type: 2, r: 10},

    ],
        
    edges: [
            { source: 0, target: 1 },
            { source: 0, target: 2 },
            { source: 0, target: 3 },

            { source: 10, target: 11 },
            { source: 10, target: 12 },
            { source: 10, target: 13 },

            { source: 20, target: 21 },
            { source: 20, target: 22 },
            { source: 20, target: 23 },
    ]
        
}

class GraphDataHandler{
    INODES = 'involved_nodes';
    UNODES = 'uninvolved_nodes';

    MIN_RADIUS = 1;
    MAX_RADIUS = 3;

    constructor(rawData){
        const social_network = rawData.social_network;

        this.rawData = rawData;

        /**
         * 获取inodes并进行相关处理
        */
        this.inodes = social_network.nodes.involved_nodes;
        this.inodes_follower = [];
        this.inodes.forEach(node=>{
            node.id = node.user_id;
            node.name = node.id;
            node.type = this.INODES;
            node.user_follower = +node.followers_count

            this.inodes_follower.push(+node.followers_count)
        })

        /**
         * 统计inodes follower分布、设置比例尺
         */
        const [rScale, unodeFollowerRandomFunc] = this.handleFollower();
        window.rScale = rScale

        

        /**
         * 指定unodes并进行相关处理
        */
        this.unodes = social_network.nodes.uninvolved_nodes[0].user_id.map(e=>({
            id:e, 
            name:e, 
            type:this.UNODES,
            user_follower: unodeFollowerRandomFunc()
        }));

        this.allNodes =  [ ...this.inodes, ...this.unodes ];
        this.allNodes.forEach(node=>{
            node.r = rScale(node.user_follower)
        })

        this.allEdges = social_network.edges

        /**
         * 这些数据用于其他用途
         */
        this.unodesId = this.unodes.map(node=>node.id);
        this.inodesId = this.inodes.map(node=>node.id);

    }

    /**
     * 
     * @returns 
     */
    handleFollower(){
        const [min, max] = d3.extent(this.inodes_follower);
        console.log({min,max})
        return [
            d3.scaleLinear().domain([min, max]).range([this.MIN_RADIUS, this.MAX_RADIUS]),
            () => {
                let rand = Math.random();
                rand = min + (max - min) * rand;
                return Math.floor(rand) / 2;
            }
        ]
    }

    getAllNodes(){
        return this.allNodes;
    }

    getAllEdges(){
        return this.allEdges;
    }

    getEdgesBetweenInodes(){
        if(this.edgesBeteenINodes !== undefined)return this.edgesBeteenINodes;

        this.edgesBeteenINodes = this.allEdges.filter(
            edge => this.inodesId.includes(edge.target) && this.inodesId.includes(edge.source)
        );
        return this.edgesBeteenINodes;
    }

    getEdgesBetweenUNodes(){
        if(this.edgesBeteenUNodes !== undefined)return this.edgesBeteenUNodes;

        this.edgesBeteenUNodes = this.allEdges.filter(
            edge => this.unodesId.includes(edge.target) && this.unodesId.includes(edge.source)
        );
        return this.edgesBeteenUNodes;
    }

    getAnimationResult(){
        const userIdToIndex = {};

        const nodes = this.allNodes.map((node, index)=>{
            userIdToIndex[node.id] = index;

            return {
                id: index,
                name: node.id,
                type: node.type,
                user_follower: node.user_follower,
                x: node.x,
                y: node.y,
                symbolSize: node.r
            }
        })
        .sort((a,b)=>a.type === this.INODES);

        const links = this.allEdges.map(edge=>({
            source: userIdToIndex[edge.source.id],
            target: userIdToIndex[edge.target.id],
            type: edge.type,
        }));

        return {nodes, links}
    }
}