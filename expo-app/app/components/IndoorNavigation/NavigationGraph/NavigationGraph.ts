type NavigationGraphNode = {
    name: string;
    neighbours: Map<string, number>;
}

export default class NavigationGraph {
    public nodes: NavigationGraphNode[];

    constructor() {
        this.nodes = [];
    }

    public createNode(name: string): void {
        this.nodes.push({name, neighbours: new Map<string, number>()});
    }

    public addEdge(node1: string, node2: string, weight: number): void {
        const n1 = this.nodes.find(n => n.name === node1);
        const n2 = this.nodes.find(n => n.name === node2);
        if (n1 && n2) {
            n1.neighbours.set(n2.name, weight);
            n2.neighbours.set(n1.name, weight);
        }
        else {
            let badNodes: string = "";
            if (!n1) {
                badNodes += `${node1} `;
            }
            if (!n2) {
                badNodes += `${node2} `;
            }
            console.warn(`Nodes ${badNodes} not found.`)
        }
    }

    public getShortestPath(start: string, end: string): string[] {
        const startNode = this.nodes.find(n => n.name === start);
        const endNode = this.nodes.find(n => n.name === end);
        if (!startNode || !endNode) {
            throw new Error("Start or end node not found.");
        }

        // Dijkstra's algorithm
        const distances: Map<string, number> = new Map();
        const previous: Map<string, string | null> = new Map();
        const queue: Array<string> = [];
        const visited: Set<string> = new Set();

        this.nodes.forEach(node => {
            if (node !== startNode) {
                distances.set(node.name, Infinity);
            }
            previous.set(node.name, null);
        });

        distances.set(startNode.name, 0);
        queue.push(startNode.name);

        while(true) {
            // TODO: Maybe switch to Priority queue??
            const currentNodeName = queue.shift();
            if (!currentNodeName) {
                break;
            }
            visited.add(currentNodeName);
            const currentNode = this.nodes.find(n => n.name === currentNodeName)!;
            currentNode.neighbours.forEach((weight: number, neighbourName: string) => {
                const alt = distances.get(currentNodeName)! + weight;
                if (alt < (distances.get(neighbourName) ?? Infinity)) {
                    distances.set(neighbourName, alt);
                    previous.set(neighbourName, currentNodeName);
                    if (!visited.has(neighbourName)) {
                        queue.push(neighbourName);
                    }
                }
            });
        }

        const path: string[] = [];
        let current = end;
        while (current) {
            path.unshift(current);
            current = previous.get(current)!;
        }
        return path;
    }
    

}